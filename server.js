import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import crypto from 'crypto';

// Password hashing helpers (PBKDF2 with SHA-512)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) {
    return password === storedPassword; // Backward compatibility for plain text passwords
  }
  const [salt, hash] = storedPassword.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

const app = express();
const PORT = 5050;
const MONGO_URI = 'mongodb+srv://gunaknn_db_user:gunasekarviji@cluster0.ioiwshu.mongodb.net/swiftmarket?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());


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

// ---------------- DO ITEM SCHEMA & MODEL ----------------
const doItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  time: { type: String, required: true },
  text: { type: String, required: true },
  dateStr: { type: String, required: true },
  createdAt: { type: Number, default: () => Date.now() }
});

const DoItem = mongoose.model('DoItem', doItemSchema);

// MongoDB connection & Startup migration
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected to swiftmarket database');
    try {
      const result = await DoItem.collection.updateMany(
        { dateStr: { $exists: false } },
        [
          {
            $set: {
              dateStr: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: { $toDate: "$createdAt" },
                  timezone: "Asia/Kolkata"
                }
              }
            }
          }
        ]
      );
      if (result.modifiedCount > 0) {
        console.log(`Successfully migrated ${result.modifiedCount} legacy do items without dateStr`);
      }
    } catch (migrateErr) {
      console.error('DoItem legacy migration error:', migrateErr);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

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

    const hashedPassword = hashPassword(password);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
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
    if (!user || !verifyPassword(password, user.password)) {
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

// 7. Get Do Items for Logged-in User
app.get('/api/dos', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const { date } = req.query;
    const filter = { userId };
    if (date) {
      filter.dateStr = date;
    }

    const dos = await DoItem.find(filter).sort({ createdAt: -1 }); // Sort newest first (reverse chronological order)
    res.json(dos);
  } catch (err) {
    console.error('Get dos error:', err);
    res.status(500).json({ error: 'Server error fetching dos' });
  }
});

// 8. Create Do Item
app.post('/api/dos', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const { time, text, dateStr } = req.body;
    if (!time || !text) {
      return res.status(400).json({ error: 'Time and text are required' });
    }

    const getLocalDateStr = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fallbackDateStr = dateStr || getLocalDateStr();

    const newDo = new DoItem({
      userId,
      time,
      text,
      dateStr: fallbackDateStr
    });

    await newDo.save();
    res.status(201).json(newDo);
  } catch (err) {
    console.error('Create do error:', err);
    res.status(500).json({ error: 'Server error creating do log' });
  }
});

// 9. Delete Do Item
app.delete('/api/dos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDo = await DoItem.findByIdAndDelete(id);

    if (!deletedDo) {
      return res.status(444).json({ error: 'Do log not found' });
    }

    res.json({ message: 'Do log deleted successfully' });
  } catch (err) {
    console.error('Delete do error:', err);
    res.status(500).json({ error: 'Server error deleting do log' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
