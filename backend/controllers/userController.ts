import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "secret";


interface RegisterBody { username: string; email: string; password: string; }
interface LoginBody { email: string; password: string; }
interface FriendBody { userId: string; friendId: string; }

//register user
export const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered",
      user: { id: user._id, username: user.username, email: user.email },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//login user
export const loginUser = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, username: user.username, email: user.email },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//get user profile
export const getUser = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//add a friend
export const addFriend = async (req: Request<{}, {}, FriendBody>, res: Response) => {
  try {
    const userId = req.user?.id;
    const { friendId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId))
      return res.status(400).json({ message: "Invalid ID(s)" });

    if (userId === friendId) return res.status(400).json({ message: "Cannot add yourself" });

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) return res.status(404).json({ message: "User not found" });

    if (user.friends.some((id: Types.ObjectId) => id.toString() === friendId))
      return res.status(400).json({ message: "Already friends" });

    user.friends.push(new Types.ObjectId(friendId));
    friend.friends.push(new Types.ObjectId(userId));

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend added successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//remove a friend
export const removeFriend = async (req: Request<{}, {}, FriendBody>, res: Response) => {
  try {
    const { userId, friendId } = req.body;
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId))
      return res.status(400).json({ message: "Invalid ID(s)" });

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) return res.status(404).json({ message: "User not found" });

    user.friends = user.friends.filter((id: Types.ObjectId) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id: Types.ObjectId) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//get friends list
export const getFriends = async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;
    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.friends);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
