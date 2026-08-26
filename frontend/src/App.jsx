import { useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import "./index.css";

const API_URL = "/api";

const NODE_WIDTH = 140;
const NODE_HEIGHT = 45;

// ======================================================
// DAGRE GRAPH LAYOUT
// ======================================================

function getLayoutedElements(nodes, edges) {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 60,
    ranksep: 90,
    marginx: 30,
    marginy: 30,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const position = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
}

// ======================================================
// GET ALL PREREQUISITES
// ======================================================

function getPrerequisiteChain(nodeId, edges) {
  const prerequisites = new Set();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    const incomingEdges = edges.filter(
      (edge) => edge.target === currentId
    );

    incomingEdges.forEach((edge) => {
      if (!prerequisites.has(edge.source)) {
        prerequisites.add(edge.source);
        queue.push(edge.source);
      }
    });
  }

  return prerequisites;
}

// ======================================================
// GET ORDERED LEARNING PATH
// ======================================================

function getOrderedLearningPath(nodeId, edges, nodes) {
  const visited = new Set();
  const result = [];

  function visit(currentId) {
    if (visited.has(currentId)) return;

    visited.add(currentId);

    const incomingEdges = edges.filter(
      (edge) => edge.target === currentId
    );

    incomingEdges.forEach((edge) => {
      visit(edge.source);
    });

    const node = nodes.find((item) => item.id === currentId);

    if (node) {
      result.push(node);
    }
  }

  visit(nodeId);

  return result;
}

// ======================================================
// APP
// ======================================================

function App() {
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);

  const [skills, setSkills] = useState([]);

  const [loadingCareers, setLoadingCareers] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);

  const [error, setError] = useState("");

  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  });

  // Currently selected skill/node
  const [selectedNode, setSelectedNode] = useState(null);

  // Skill search
  const [skillSearch, setSkillSearch] = useState("");

  // React Flow instance
  const reactFlowInstance = useRef(null);

  // ======================================================
  // LOAD CAREERS
  // ======================================================

  useEffect(() => {
    fetch(`${API_URL}/api/careers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load careers");
        }

        return response.json();
      })
      .then((data) => {
        setCareers(data);

        if (data.length > 0) {
          setSelectedCareer(data[0]);
        }
      })
      .catch(() => {
        setError(
          "Unable to connect to SkillPath. Make sure the backend is running."
        );
      })
      .finally(() => {
        setLoadingCareers(false);
      });
  }, []);

  // ======================================================
  // LOAD CAREER SKILLS
  // ======================================================

  useEffect(() => {
    if (!selectedCareer) return;

    setLoadingSkills(true);
    setError("");
    setSkillSearch("");

    fetch(
      `${API_URL}/api/careers/${encodeURIComponent(
        selectedCareer.name
      )}/skills`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load skills");
        }

        return response.json();
      })
      .then((data) => {
        setSkills(data);
      })
      .catch(() => {
        setError("Unable to load skills for this career.");
      })
      .finally(() => {
        setLoadingSkills(false);
      });
  }, [selectedCareer]);

  // ======================================================
  // LOAD GRAPH
  // ======================================================

  useEffect(() => {
    if (!selectedCareer) return;

    setSelectedNode(null);
    setLoadingGraph(true);

    fetch(
      `${API_URL}/api/careers/${encodeURIComponent(
        selectedCareer.name
      )}/graph`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load graph");
        }

        return response.json();
      })
      .then((data) => {
        // -------------------------------
        // CREATE NODES
        // -------------------------------

        const nodes = data.nodes.map((node) => {
          let borderColor = "#343746";
          let backgroundColor = "#171923";
          const textColor = "#f5f7fa";

          if (node.difficulty === "Beginner") {
            borderColor = "#22c55e";
            backgroundColor = "#102018";
          } else if (node.difficulty === "Intermediate") {
            borderColor = "#3b82f6";
            backgroundColor = "#101a2b";
          } else if (node.difficulty === "Advanced") {
            borderColor = "#8b5cf6";
            backgroundColor = "#1b132d";
          }

          return {
            id: node.id,

            data: {
              label: node.name,
              name: node.name,
              category: node.category,
              difficulty: node.difficulty,

              baseBorderColor: borderColor,
              baseBackgroundColor: backgroundColor,
              baseTextColor: textColor,
            },

            position: {
              x: 0,
              y: 0,
            },

            style: {
              background: backgroundColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "11px",
              fontWeight: "500",
              width: NODE_WIDTH,
              minHeight: NODE_HEIGHT,
              textAlign: "center",
              boxSizing: "border-box",
              boxShadow: `0 0 12px ${borderColor}22`,
              transition:
                "opacity 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
            },
          };
        });

        // -------------------------------
        // CREATE EDGES
        // -------------------------------

        const edges = data.edges.map((edge, index) => ({
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,

          type: "smoothstep",

          animated: false,

          style: {
            stroke: "#7659dc",
            strokeWidth: 1.6,
            opacity: 0.8,
            transition: "opacity 0.2s ease",
          },

          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: "#7659dc",
          },
        }));

        // -------------------------------
        // DAGRE LAYOUT
        // -------------------------------

        const layouted = getLayoutedElements(nodes, edges);

        setGraphData(layouted);
      })
      .catch((graphError) => {
        console.error("Graph loading error:", graphError);

        setGraphData({
          nodes: [],
          edges: [],
        });
      })
      .finally(() => {
        setLoadingGraph(false);
      });
  }, [selectedCareer]);

  // ======================================================
  // SKILL STATISTICS
  // ======================================================

  const advancedSkills = skills.filter(
    (skill) => skill.difficulty === "Advanced"
  ).length;

  const intermediateSkills = skills.filter(
    (skill) => skill.difficulty === "Intermediate"
  ).length;

  // ======================================================
  // FILTERED SKILLS
  // ======================================================

  const filteredSkills = skills.filter((skill) =>
    skill.name
      .toLowerCase()
      .includes(skillSearch.toLowerCase())
  );

  // ======================================================
  // PREREQUISITE CHAIN
  // ======================================================

  const prerequisiteIds = useMemo(() => {
    if (!selectedNode) {
      return new Set();
    }

    return getPrerequisiteChain(
      selectedNode.id,
      graphData.edges
    );
  }, [selectedNode, graphData.edges]);

  // ======================================================
  // LEARNING PATH
  // ======================================================

  const learningPath = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    return getOrderedLearningPath(
      selectedNode.id,
      graphData.edges,
      graphData.nodes
    );
  }, [
    selectedNode,
    graphData.edges,
    graphData.nodes,
  ]);

  // ======================================================
  // DISPLAYED NODES
  // ======================================================

  const displayedNodes = useMemo(() => {
    if (!selectedNode) {
      return graphData.nodes;
    }

    return graphData.nodes.map((node) => {
      const isSelected = node.id === selectedNode.id;
      const isPrerequisite = prerequisiteIds.has(node.id);

      const baseBorder =
        node.data.baseBorderColor || "#343746";

      const baseBackground =
        node.data.baseBackgroundColor || "#171923";

      // Selected node
      if (isSelected) {
        return {
          ...node,

          style: {
            ...node.style,

            opacity: 1,

            border: "2px solid #a78bfa",

            background: "#24163d",

            boxShadow:
              "0 0 0 3px rgba(139,92,246,0.18), 0 0 28px rgba(139,92,246,0.65)",

            transform: "scale(1.05)",

            zIndex: 10,
          },
        };
      }

      // Prerequisite node
      if (isPrerequisite) {
        return {
          ...node,

          style: {
            ...node.style,

            opacity: 1,

            border: `2px solid ${baseBorder}`,

            background: baseBackground,

            boxShadow:
              `0 0 18px ${baseBorder}88`,

            filter: "none",

            zIndex: 5,
          },
        };
      }

      // Unrelated node
      return {
        ...node,

        style: {
          ...node.style,

          opacity: 0.22,

          filter: "grayscale(0.5)",

          boxShadow: "none",

          zIndex: 1,
        },
      };
    });
  }, [
    graphData.nodes,
    selectedNode,
    prerequisiteIds,
  ]);

  // ======================================================
  // DISPLAYED EDGES
  // ======================================================

  const displayedEdges = useMemo(() => {
    if (!selectedNode) {
      return graphData.edges;
    }

    return graphData.edges.map((edge) => {
      const belongsToPath =
        prerequisiteIds.has(edge.source) &&
        (
          prerequisiteIds.has(edge.target) ||
          edge.target === selectedNode.id
        );

      const directlyTargetsSelected =
        edge.target === selectedNode.id &&
        prerequisiteIds.has(edge.source);

      if (belongsToPath || directlyTargetsSelected) {
        return {
          ...edge,

          animated: true,

          style: {
            ...edge.style,

            stroke: "#a78bfa",
            strokeWidth: 2.8,
            opacity: 1,

            filter:
              "drop-shadow(0 0 5px rgba(167,139,250,0.75))",
          },

          markerEnd: {
            ...edge.markerEnd,
            color: "#a78bfa",
          },
        };
      }

      return {
        ...edge,

        animated: false,

        style: {
          ...edge.style,

          stroke: "#7659dc",
          strokeWidth: 1.2,
          opacity: 0.12,
        },

        markerEnd: {
          ...edge.markerEnd,
          color: "#7659dc",
        },
      };
    });
  }, [
    graphData.edges,
    selectedNode,
    prerequisiteIds,
  ]);

  // ======================================================
  // DIRECT PREREQUISITES
  // ======================================================

  const selectedNodePrerequisites = selectedNode
    ? graphData.edges
        .filter(
          (edge) => edge.target === selectedNode.id
        )
        .map((edge) =>
          graphData.nodes.find(
            (node) => node.id === edge.source
          )
        )
        .filter(Boolean)
    : [];

  // ======================================================
  // FOCUS SELECTED NODE
  // ======================================================

  const focusSelectedNode = (node) => {
    setSelectedNode(node);

    requestAnimationFrame(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({
          nodes: [{ id: node.id }],
          duration: 500,
          padding: 0.7,
          maxZoom: 1.35,
        });
      }
    });
  };

  // ======================================================
  // SELECT SKILL FROM SEARCH/LIST
  // ======================================================

  const selectSkill = (skill) => {
    const matchingNode = graphData.nodes.find(
      (node) => node.data.name === skill.name
    );

    if (matchingNode) {
      focusSelectedNode(matchingNode);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="app">

      {/* ==================================================
          SIDEBAR
          ================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            ✦
          </div>

          <div>
            <h1>SkillPath</h1>
            <span>Career Graph Explorer</span>
          </div>

        </div>

        <div className="sidebar-section">

          <p className="section-label">
            EXPLORE
          </p>

          {loadingCareers ? (
            <div className="sidebar-loading">
              Loading careers...
            </div>
          ) : (
            careers.map((career) => (
              <button
                key={career.name}
                className={`career-item ${
                  selectedCareer?.name === career.name
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setSelectedCareer(career);
                  setSelectedNode(null);
                  setSkillSearch("");
                }}
              >
                <span className="career-icon">
                  ◆
                </span>

                {career.name}
              </button>
            ))
          )}

        </div>

        <div className="sidebar-footer">

          <div className="status-dot" />

          <span>
            Graph database connected
          </span>

        </div>

      </aside>

      {/* ==================================================
          MAIN
          ================================================== */}

      <main className="main">

        {/* ==================================================
            TOP BAR
            ================================================== */}

        <header className="topbar">

          <div>

            <span className="eyebrow">
              CAREER EXPLORER
            </span>

            <h2>
              Build your path.
            </h2>

          </div>

          <div className="connection">

            <span className="status-dot" />

            CognoDB

          </div>

        </header>

        {/* ==================================================
            ERROR
            ================================================== */}

        {error && (
          <div className="error-banner">

            <strong>
              Connection issue
            </strong>

            <span>
              {error}
            </span>

          </div>
        )}

        {/* ==================================================
            SELECTED CAREER
            ================================================== */}

        {selectedCareer && (
          <>

            {/* ==================================================
                HERO
                ================================================== */}

            <section className="hero">

              <div>

                <span className="eyebrow">
                  TARGET CAREER
                </span>

                <h3>
                  {selectedCareer.name}
                </h3>

                <p>
                  {selectedCareer.description}
                </p>

              </div>

              <div className="hero-badge">

                <span>
                  Graph-powered
                </span>

                <strong>
                  Career Path
                </strong>

              </div>

            </section>

            {/* ==================================================
                STATISTICS
                ================================================== */}

            <section className="stats">

              <div className="stat-card">

                <span>
                  Total Skills
                </span>

                <strong>
                  {skills.length}
                </strong>

                <small>
                  required for this role
                </small>

              </div>

              <div className="stat-card">

                <span>
                  Intermediate
                </span>

                <strong>
                  {intermediateSkills}
                </strong>

                <small>
                  skills to develop
                </small>

              </div>

              <div className="stat-card">

                <span>
                  Advanced
                </span>

                <strong>
                  {advancedSkills}
                </strong>

                <small>
                  specialized skills
                </small>

              </div>

            </section>

            {/* ==================================================
                CONTENT GRID
                ================================================== */}

            <section className="content-grid">

              {/* ==================================================
                  SKILLS PANEL
                  ================================================== */}

              <div className="panel skills-panel">

                <div className="panel-header">

                  <div>

                    <span className="eyebrow">
                      REQUIRED SKILLS
                    </span>

                    <h4>
                      Skill Map
                    </h4>

                  </div>

                  <span className="count">
                    {skills.length}
                  </span>

                </div>

                {/* SEARCH BOX */}

                <div
                  className="skill-search"
                  style={{
                    padding:
                      "0 16px 12px 16px",
                  }}
                >

                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(event) =>
                      setSkillSearch(
                        event.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 12px",
                      border:
                        "1px solid #2b2e3b",
                      borderRadius: "8px",
                      background: "#101118",
                      color: "#f5f7fa",
                      outline: "none",
                      fontSize: "12px",
                    }}
                  />

                </div>

                {loadingSkills ? (

                  <div className="loading-state">

                    <div className="spinner" />

                    Loading skill graph...

                  </div>

                ) : skills.length === 0 ? (

                  <div className="empty-state">
                    No skills found for this career.
                  </div>

                ) : filteredSkills.length === 0 ? (

                  <div className="empty-state">
                    No matching skills found.
                  </div>

                ) : (

                  <div className="skill-list">

                    {filteredSkills.map(
                      (skill) => (

                        <div
                          className="skill-card"
                          key={skill.name}
                          onClick={() =>
                            selectSkill(skill)
                          }
                          style={{
                            cursor: "pointer",
                          }}
                        >

                          <div className="skill-main">

                            <div className="skill-node">
                              ●
                            </div>

                            <div>

                              <strong>
                                {skill.name}
                              </strong>

                              <span>
                                {skill.category}
                              </span>

                            </div>

                          </div>

                          <span
                            className={`difficulty ${
                              skill.difficulty.toLowerCase()
                            }`}
                          >
                            {skill.difficulty}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* ==================================================
                  GRAPH PANEL
                  ================================================== */}

              <div className="panel graph-preview">

                <div className="panel-header">

                  <div>

                    <span className="eyebrow">
                      GRAPH VIEW
                    </span>

                    <h4>
                      How skills connect
                    </h4>

                    {/* GRAPH LEGEND */}

                    <div className="graph-legend">

                      <span>
                        <i className="legend-dot beginner" />
                        Beginner
                      </span>

                      <span>
                        <i className="legend-dot intermediate" />
                        Intermediate
                      </span>

                      <span>
                        <i className="legend-dot advanced" />
                        Advanced
                      </span>

                    </div>

                    {/* SELECTED SKILL MESSAGE */}

                    {selectedNode && (

                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "10px",
                          color: "#9ca3af",
                        }}
                      >

                        Highlighting learning path for{" "}

                        <strong
                          style={{
                            color: "#c4b5fd",
                          }}
                        >
                          {selectedNode.data.name}
                        </strong>

                      </div>

                    )}

                  </div>

                </div>

                {/* ==================================================
                    GRAPH CANVAS
                    ================================================== */}

                <div className="graph-canvas real-graph">

                  {loadingGraph ? (

                    <div className="loading-state">

                      <div className="spinner" />

                      Loading graph...

                    </div>

                  ) : graphData.nodes.length === 0 ? (

                    <div className="empty-state">
                      No graph relationships found.
                    </div>

                  ) : (

                    <ReactFlow
                      nodes={displayedNodes}
                      edges={displayedEdges}

                      onInit={(instance) => {
                        reactFlowInstance.current =
                          instance;
                      }}

                      onNodeClick={(_, node) => {
                        focusSelectedNode(node);
                      }}

                      onPaneClick={() => {

                        setSelectedNode(null);

                        requestAnimationFrame(
                          () => {

                            if (
                              reactFlowInstance.current
                            ) {

                              reactFlowInstance.current.fitView(
                                {
                                  duration: 400,
                                  padding: 0.2,
                                  maxZoom: 1.1,
                                }
                              );

                            }

                          }
                        );

                      }}

                      fitView

                      fitViewOptions={{
                        padding: 0.2,
                      }}

                      attributionPosition="bottom-left"
                    >

                      <Background gap={24} />

                      <Controls />

                      <MiniMap />

                    </ReactFlow>

                  )}

                  {/* ==================================================
                      SELECTED NODE DETAILS
                      ================================================== */}

                  {selectedNode && (

                    <div className="node-details-panel">

                      <button
                        className="node-details-close"
                        onClick={(event) => {

                          event.stopPropagation();

                          setSelectedNode(null);

                        }}
                        aria-label="Close details"
                      >
                        ×
                      </button>

                      <span className="eyebrow">
                        SKILL DETAILS
                      </span>

                      <h5>
                        {selectedNode.data.name}
                      </h5>

                      {/* CATEGORY */}

                      <div className="node-detail-row">

                        <span>
                          Category
                        </span>

                        <strong>
                          {selectedNode.data.category ||
                            "Skill"}
                        </strong>

                      </div>

                      {/* DIFFICULTY */}

                      <div className="node-detail-row">

                        <span>
                          Difficulty
                        </span>

                        <strong
                          className={`node-detail-difficulty ${
                            selectedNode.data.difficulty?.toLowerCase() ||
                            ""
                          }`}
                        >
                          {selectedNode.data.difficulty ||
                            "Not specified"}
                        </strong>

                      </div>

                      {/* PREREQUISITES */}

                      <div className="node-detail-row">

                        <span>
                          Prerequisites
                        </span>

                        <strong>
                          {selectedNodePrerequisites.length}
                        </strong>

                      </div>

                      {/* LEARNING PATH COUNT */}

                      {prerequisiteIds.size > 0 && (

                        <div
                          className="node-detail-row"
                          style={{
                            marginTop: "4px",
                          }}
                        >

                          <span>
                            Learning path
                          </span>

                          <strong
                            style={{
                              color: "#a78bfa",
                            }}
                          >
                            {prerequisiteIds.size + 1} skills
                          </strong>

                        </div>

                      )}

                      {/* DIRECT PREREQUISITES */}

                      {selectedNodePrerequisites.length >
                        0 && (

                        <div className="prerequisite-list">

                          <span>
                            LEARN BEFORE
                          </span>

                          {selectedNodePrerequisites.map(
                            (prerequisite) => (

                              <div
                                key={
                                  prerequisite.id
                                }
                              >

                                <span>
                                  →
                                </span>

                                {
                                  prerequisite.data
                                    .name
                                }

                              </div>

                            )
                          )}

                        </div>

                      )}

                      {/* FULL LEARNING PATH */}

                      {learningPath.length > 1 && (

                        <div className="prerequisite-list">

                          <span>
                            LEARNING PATH
                          </span>

                          <div
                            style={{
                              display: "flex",
                              flexDirection:
                                "column",
                              gap: "6px",
                              marginTop: "7px",
                            }}
                          >

                            {learningPath.map(
                              (
                                pathNode,
                                index
                              ) => (

                                <div
                                  key={
                                    pathNode.id
                                  }
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "7px",
                                    color:
                                      pathNode.id ===
                                      selectedNode.id
                                        ? "#c4b5fd"
                                        : "#b8bdca",
                                    fontWeight:
                                      pathNode.id ===
                                      selectedNode.id
                                        ? "600"
                                        : "400",
                                  }}
                                >

                                  <span
                                    style={{
                                      width: "18px",
                                      height: "18px",
                                      borderRadius:
                                        "50%",
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      fontSize:
                                        "9px",
                                      background:
                                        pathNode.id ===
                                        selectedNode.id
                                          ? "rgba(139,92,246,0.25)"
                                          : "rgba(255,255,255,0.06)",
                                      color:
                                        pathNode.id ===
                                        selectedNode.id
                                          ? "#c4b5fd"
                                          : "#8f96a8",
                                    }}
                                  >
                                    {index + 1}
                                  </span>

                                  <span>
                                    {
                                      pathNode.data
                                        .name
                                    }
                                  </span>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )}

                      {/* EXPLANATION */}

                      {prerequisiteIds.size > 0 && (

                        <div
                          style={{
                            marginTop: "14px",
                            paddingTop: "12px",
                            borderTop:
                              "1px solid rgba(255,255,255,0.08)",
                            fontSize: "10px",
                            lineHeight: "1.5",
                            color: "#8f96a8",
                          }}
                        >

                          The highlighted nodes show
                          the prerequisite chain you
                          should complete before
                          learning this skill.

                        </div>

                      )}

                    </div>

                  )}

                </div>

              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default App;