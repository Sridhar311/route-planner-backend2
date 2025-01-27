const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
const allowedOrigins = [
  "https://sridhar311.github.io", // Production URL
  "http://127.0.0.1:5500" // Local development URL
];
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
  Chennai: { Kanchipuram: 72, Tiruvallur: 45, Villupuram: 120 },
  Tiruvallur: { Chennai: 45, Kanchipuram: 60, Chittoor: 85 },
  Kanchipuram: { Chennai: 72, Tiruvallur: 60, Villupuram: 113, Vellore: 87 },
  Vellore: { Kanchipuram: 87, Tiruvannamalai: 82, Krishnagiri: 140 },
  Villupuram: { Kanchipuram: 113, Cuddalore: 40, Tiruvannamalai: 106, Pondicherry: 38 },
  Pondicherry: { Villupuram: 38, Cuddalore: 22 },
  Cuddalore: { Villupuram: 40, Nagapattinam: 144, Thanjavur: 115, Pondicherry: 22 },
  Nagapattinam: { Cuddalore: 144, Thanjavur: 85, Karaikal: 20, Tiruvarur: 30 },
  Tiruvarur: { Nagapattinam: 30, Thanjavur: 45, Karaikal: 30 },
  Thanjavur: { Tiruvarur: 45, Nagapattinam: 85, Trichy: 58, Pudukkottai: 52 },
  Pudukkottai: { Trichy: 55, Thanjavur: 52, Sivaganga: 75, Ramanathapuram: 115 },
  Sivaganga: { Pudukkottai: 75, Madurai: 48, Ramanathapuram: 125 },
  Ramanathapuram: { Sivaganga: 125, Pudukkottai: 115, Thoothukudi: 120, Rameshwaram: 55 },
  Rameshwaram: { Ramanathapuram: 55 },
  Thoothukudi: { Ramanathapuram: 120, Tirunelveli: 60, Kanyakumari: 90 },
  Tirunelveli: { Thoothukudi: 60, Kanyakumari: 85, Tenkasi: 55 },
  Kanyakumari: { Tirunelveli: 85, Thoothukudi: 90, Trivandrum: 90 },
  Trichy: { Thanjavur: 58, Pudukkottai: 55, Namakkal: 91, Karur: 83 },
  Namakkal: { Trichy: 91, Salem: 56, Erode: 90, Karur: 57 },
  Karur: { Namakkal: 57, Trichy: 83, Erode: 65, Dindigul: 75 },
  Dindigul: { Karur: 75, Madurai: 63, Theni: 70, Coimbatore: 155 },
  Theni: { Dindigul: 70, Madurai: 76, Kambam: 47, Idukki: 55 },
  Kambam: { Theni: 47, Idukki: 60 },
  Idukki: { Kambam: 60, Theni: 55 },
  Coimbatore: { Erode: 99, Tiruppur: 55, Dindigul: 155, Nilgiris: 75 },
  Tiruppur: { Coimbatore: 55, Erode: 49 },
  Erode: { Salem: 64, Coimbatore: 99, Tiruppur: 49, Namakkal: 90 },
  Salem: { Namakkal: 56, Erode: 64, Dharmapuri: 68, Krishnagiri: 90 },
  Dharmapuri: { Salem: 68, Krishnagiri: 52, Tiruvannamalai: 100 },
  Krishnagiri: { Salem: 90, Dharmapuri: 52, Tiruvannamalai: 140, Vellore: 140 },
  Tiruvannamalai: { Villupuram: 106, Vellore: 82, Krishnagiri: 140, Dharmapuri: 100 },
};

// Dijkstra's Algorithm with Debugging
function dijkstra(graph, start, goal) {
  const distances = {};
  const priorityQueue = [];
  const predecessors = {};

  Object.keys(graph).forEach((node) => {
    distances[node] = Infinity;
    predecessors[node] = null;
  });

  distances[start] = 0;
  priorityQueue.push({ node: start, cost: 0 });

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.cost - b.cost);
    const { node: currentNode } = priorityQueue.shift();

    console.log(`Visiting node: ${currentNode}, Cost so far: ${distances[currentNode]}`);

    if (currentNode === goal) break;

    for (const [neighbor, cost] of Object.entries(graph[currentNode])) {
      const newCost = distances[currentNode] + cost;
      console.log(`Checking neighbor: ${neighbor}, Cost: ${cost}, New cost: ${newCost}`);
      if (newCost < distances[neighbor]) {
        distances[neighbor] = newCost;
        predecessors[neighbor] = currentNode;
        priorityQueue.push({ node: neighbor, cost: newCost });
      }
    }
  }

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
  console.log("HIs");
  
  const { start, goal } = req.body;

  if (!start || !goal) {
    return res.status(400).json({ error: "Start and goal are required." });
  }


  if (!graph[start] || !graph[goal]) {
    console.log(start, goal, graph[goal], graph[start]);
    return res.status(400).json({ error: "Invalid start or goal point." });
  }

  const result = dijkstra(graph, start, goal);
  console.log(result);
  if (result.distance === Infinity) {
    return res.status(404).json({ error: "uygyut67" });
  }

  res.json(result);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
