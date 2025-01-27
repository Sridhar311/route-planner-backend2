const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; 

// Middleware
app.use(bodyParser.json());
const allowedOrigins = ["https://sridhar311.github.io"]; 
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

const graph = {
  Coimbatore: { Madurai: 207, Rameshwaram: 379 },
  Madurai: { Coimbatore: 207, Dindugal: 64 },
  Dindugal: { Madurai: 64, Rameshwaram: 231 },
  Rameshwaram: { Coimbatore: 379, Dindugal: 231 },
};

// Dijkstra's Algorithm
function dijkstra(graph, start, goal) {
  const distances = {};
  const priorityQueue = [];
  const predecessors = {};

  // Initialize distances and predecessors
  Object.keys(graph).forEach((node) => {
    distances[node] = Infinity;
    predecessors[node] = null;
  });

  distances[start] = 0;
  priorityQueue.push({ node: start, cost: 0 });

  while (priorityQueue.length > 0) {
    // Sort the priority queue by cost
    priorityQueue.sort((a, b) => a.cost - b.cost);
    const { node: currentNode } = priorityQueue.shift();

    // Stop if we reached the goal
    if (currentNode === goal) break;

    // Update distances to neighbors
    for (const [neighbor, cost] of Object.entries(graph[currentNode])) {
      const newCost = distances[currentNode] + cost;
      if (newCost < distances[neighbor]) {
        distances[neighbor] = newCost;
        predecessors[neighbor] = currentNode;
        priorityQueue.push({ node: neighbor, cost: newCost });
      }
    }
  }

  // Construct the shortest path
  const path = [];
  let current = goal;
  while (current) {
    path.push(current);
    current = predecessors[current];
  }

  path.reverse();
  return { path, distance: distances[goal] };
}

// API Routes
app.post("/", (req, res) => {
  const { start, goal } = req.body;

  if (!start || !goal) {
    return res.status(400).json({ error: "Start and goal are required." });
  }

  if (!graph[start] || !graph[goal]) {
    return res.status(400).json({ error: "Invalid start or goal point." });
  }

  const result = dijkstra(graph, start, goal);
  if (result.distance === Infinity) {
    return res.status(404).json({ error: "No path found." });
  }

  res.json(result);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
