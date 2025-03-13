import React, { useContext, useEffect, useState } from "react";
import { userContext } from "../context/UserContext";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(userContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const [project, setProject] = useState([]);

  console.log("User Data: ",user);

  const navigate = useNavigate();

  const getAllProjects = () => {
    axios
      .get("/project/all")
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  function createProject(e) {
    e.preventDefault();
    console.log("Creating Project");
    console.log("Project NAME: ", projectName);

    axios
      .post("/project/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <main className="p-4 text-white">
      <div className="projects flex flex-wrap gap-3">
        <button
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="project p-4 rounded-md border border-slate-100 cursor-pointer"
        >
          <span>New project</span>
          <i className="ri-link ml-2"></i>
        </button>

        {project.map((elem) => (
          <div
            key={elem._id}
            onClick={() => {
              navigate("/project", {
                state: { elem },
              });
            }}
            className="project flex flex-col gap-2 p-4 cursor-pointer border border-slate-300 rounded-md min-w-52 hover:bg-slate-700"
          >
            <h2 className="font-semibold">{elem.name}</h2>

            <div className="flex gap-2">
              <p>
                <i className="ri-group-line text-sm"></i>{" "}
                <small>Collaborators:</small>
              </p>
              {elem.users.length}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex justify-center items-center">
          <div className="bg-[#192230] p-6 rounded-lg w-96 shadow-lg">
            <div className="w-full flex justify-between items-start">
              <h2 className="text-lg font-semibold mb-4">Create Project</h2>
              <button
                className="cursor-pointer"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                <i className="ri-close-large-line"></i>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                createProject(e);
              }}
            >
              <input
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                }}
                type="text"
                placeholder="Project Name"
                className="w-full p-2 rounded-lg bg-slate-800 text-white mb-4 border border-slate-700 focus:outline-none"
              />

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 p-2 rounded-lg cursor-pointer"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
