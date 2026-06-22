import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = 5050;
const MONGO_URI = 'mongodb+srv://gunaknn_db_user:gunasekarviji@cluster0.ioiwshu.mongodb.net/swiftmarket?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to swiftmarket database'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---------------- USER SCHEMA & MODEL ----------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// ---------------- TODO SCHEMA & MODEL ----------------
const subtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const todoSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Links task to a user
  title: { type: String, required: true },
  description: { type: String, default: '' },
  categoryId: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  dueDate: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Number, default: () => Date.now() },
  subtasks: [subtaskSchema]
});

const Todo = mongoose.model('Todo', todoSchema);

// ---------------- ROUTES ----------------

// 1. User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await newUser.save();
    
    res.status(201).json({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 3. Get Todos for Logged-in User
app.get('/api/todos', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error('Get todos error:', err);
    res.status(500).json({ error: 'Server error fetching todos' });
  }
});

// 4. Create Todo
app.post('/api/todos', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const { title, description, categoryId, priority, dueDate, subtasks } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = new Todo({
      userId,
      title,
      description,
      categoryId,
      priority,
      dueDate,
      subtasks: subtasks || []
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ error: 'Server error creating todo' });
  }
});

// 5. Update Todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTodo = await Todo.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedTodo) {
      return res.status(444).json({ error: 'Task not found' });
    }

    res.json(updatedTodo);
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ error: 'Server error updating todo' });
  }
});

// 6. Delete Todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(444).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete todo error:', err);
    res.status(500).json({ error: 'Server error deleting todo' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
