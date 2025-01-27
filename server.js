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
  Chennai: { Kanchipuram: 72, Vellore: 137, Tiruvallur: 45 },
  Kanchipuram: { Chennai: 72, Vellore: 87, Villupuram: 113 },
  Vellore: { Chennai: 137, Kanchipuram: 87, Tiruvannamalai: 82, Krishnagiri: 139 },
  Tiruvallur: { Chennai: 45, Vellore: 97 },
  Villupuram: { Kanchipuram: 113, Tiruvannamalai: 106, Cuddalore: 40 },
  Tiruvannamalai: { Vellore: 82, Villupuram: 106, Salem: 135 },
  Cuddalore: { Villupuram: 40, Pudukkottai: 175, Nagapattinam: 144 },
  Salem: { Tiruvannamalai: 135, Namakkal: 56, Dharmapuri: 68, Erode: 64 },
  Namakkal: { Salem: 56, Trichy: 91, Karur: 87 },
  Dharmapuri: { Salem: 68, Krishnagiri: 47 },
  Erode: { Salem: 64, Coimbatore: 99, Karur: 65 },
  Coimbatore: { Erode: 99, Tiruppur: 55, Nilgiris: 83 },
  Tiruppur: { Coimbatore: 55, Erode: 49 },
  Karur: { Namakkal: 87, Erode: 65, Trichy: 83 },
  Trichy: { Namakkal: 91, Karur: 83, Thanjavur: 58, Pudukkottai: 61 },
  Thanjavur: { Trichy: 58, Nagapattinam: 84, Pudukkottai: 52 },
  Pudukkottai: { Trichy: 61, Thanjavur: 52, Sivaganga: 74, Ramanathapuram: 113 },
  Sivaganga: { Pudukkottai: 74, Madurai: 48 },
  Ramanathapuram: { Pudukkottai: 113, Madurai: 115, Thoothukudi: 108 },
  Madurai: { Sivaganga: 48, Ramanathapuram: 115, Dindigul: 63, Theni: 76 },
  Theni: { Madurai: 76, Dindigul: 75 },
  Dindigul: { Madurai: 63, Theni: 75, Karur: 90 },
  Nilgiris: { Coimbatore: 83 },
  Nagapattinam: { Thanjavur: 84, Cuddalore: 144 },
  Thoothukudi: { Ramanathapuram: 108, Tirunelveli: 48 },
  Tirunelveli: { Thoothukudi: 48, Kanyakumari: 85 },
  Kanyakumari: { Tirunelveli: 85 }
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
