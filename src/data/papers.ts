export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  category: string;
  tags: string[];
  natureUrl: string;
  githubUrl?: string;
  datasetUrl?: string;
  datasetDescription?: string;
  doi: string;
  citations: number;
}

export const papers: Paper[] = [
  {
    id: "1",
    title: "Machine learning for molecular simulation of material properties",
    authors: ["Wei Chen", "Jian Liu", "Sarah Mitchell", "Robert Zhang"],
    abstract: "We present a comprehensive machine learning framework for predicting molecular dynamics simulations of complex material systems. Our approach combines graph neural networks with attention mechanisms to achieve state-of-the-art accuracy in predicting material properties from atomic structures.",
    publishedDate: "2024-11-15",
    category: "Machine Learning",
    tags: ["ML", "Simulation", "Dataset"],
    natureUrl: "https://www.nature.com/articles/s41586-024-07487-w",
    githubUrl: "https://github.com/example/ml-molecular-sim",
    datasetUrl: "https://zenodo.org/record/12345678",
    datasetDescription: "Contains 50,000 molecular structures with DFT-calculated properties",
    doi: "10.1038/s41586-024-07487-w",
    citations: 127,
  },
  {
    id: "2",
    title: "High-entropy alloys with exceptional mechanical properties at cryogenic temperatures",
    authors: ["Maria Santos", "James Wilson", "Yuki Tanaka"],
    abstract: "This study reports the discovery of a new class of high-entropy alloys exhibiting unprecedented mechanical strength and ductility at cryogenic temperatures. We demonstrate that the unique atomic configuration leads to enhanced plasticity mechanisms.",
    publishedDate: "2024-10-28",
    category: "Alloys",
    tags: ["Experimental", "Dataset"],
    natureUrl: "https://www.nature.com/articles/s41586-024-08123-x",
    datasetUrl: "https://materialscloud.org/work/tools/hea-cryo",
    datasetDescription: "Mechanical testing data for 200+ HEA compositions",
    doi: "10.1038/s41586-024-08123-x",
    citations: 84,
  },
  {
    id: "3",
    title: "Autonomous synthesis of novel battery materials using robotic laboratories",
    authors: ["Alex Kumar", "Emily Foster", "Chen Wei", "Hans Mueller"],
    abstract: "We demonstrate a fully autonomous robotic laboratory capable of discovering and synthesizing novel battery cathode materials. The system combines high-throughput synthesis with machine learning-guided optimization to accelerate materials discovery.",
    publishedDate: "2024-09-12",
    category: "Energy Materials",
    tags: ["ML", "Automation", "Dataset", "GitHub"],
    natureUrl: "https://www.nature.com/articles/s41586-024-07892-1",
    githubUrl: "https://github.com/example/autonomous-battery-lab",
    datasetUrl: "https://github.com/example/autonomous-battery-lab/data",
    datasetDescription: "Synthesis parameters and electrochemical data for 1,500 compounds",
    doi: "10.1038/s41586-024-07892-1",
    citations: 203,
  },
  {
    id: "4",
    title: "Topological quantum materials for next-generation electronics",
    authors: ["Lisa Park", "David Thompson", "Raj Patel"],
    abstract: "This work explores the electronic properties of topological quantum materials and their potential applications in low-power electronics. We present both theoretical predictions and experimental validations of novel topological phases.",
    publishedDate: "2024-08-20",
    category: "Quantum Materials",
    tags: ["Simulation", "Experimental"],
    natureUrl: "https://www.nature.com/articles/s41586-024-07456-3",
    githubUrl: "https://github.com/example/topological-quantum",
    doi: "10.1038/s41586-024-07456-3",
    citations: 156,
  },
  {
    id: "5",
    title: "Self-healing polymers with programmable mechanical responses",
    authors: ["Sophie Brown", "Michael Lee", "Anna Kowalski"],
    abstract: "We introduce a new class of self-healing polymers that can be programmed to exhibit specific mechanical responses. The materials demonstrate autonomous repair capabilities while maintaining tunable stiffness and strength properties.",
    publishedDate: "2024-07-05",
    category: "Polymers",
    tags: ["Experimental", "Dataset"],
    natureUrl: "https://www.nature.com/articles/s41586-024-06789-w",
    datasetUrl: "https://figshare.com/articles/dataset/self_healing_polymers",
    datasetDescription: "Stress-strain curves and healing efficiency data",
    doi: "10.1038/s41586-024-06789-w",
    citations: 92,
  },
  {
    id: "6",
    title: "Graph neural networks for crystal structure prediction",
    authors: ["Kevin Zhang", "Maria Rodriguez", "Thomas Anderson"],
    abstract: "We develop a novel graph neural network architecture specifically designed for crystal structure prediction. Our model achieves unprecedented accuracy in predicting stable crystal structures from composition alone.",
    publishedDate: "2024-06-18",
    category: "Machine Learning",
    tags: ["ML", "Dataset", "GitHub"],
    natureUrl: "https://www.nature.com/articles/s41586-024-06234-5",
    githubUrl: "https://github.com/example/crystal-gnn",
    datasetUrl: "https://materialsproject.org/",
    datasetDescription: "Training data derived from Materials Project database",
    doi: "10.1038/s41586-024-06234-5",
    citations: 318,
  },
];

export const categories = [
  "All",
  "Machine Learning",
  "Alloys",
  "Energy Materials",
  "Quantum Materials",
  "Polymers",
];
