import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  recieveMessage,
  sendMessage,
} from "../config/socket";
import { userContext } from "../context/UserContext";
import Markdown from "markdown-to-jsx";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { getWebContainer } from "../config/webContainer";

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsersId, setSelectedUsersId] = useState([]);

  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.elem);
  const [message, setMessage] = useState("");
  const { user } = useContext(userContext);
  const messageBox = React.createRef();
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  
  const [webContainer , setWebContainer] = useState(null);

  const [iFrameUrl , setIFrameUrl] = useState(null);

  const [runProcess , setRunProcess] = useState(null);

  const fetchAllUsers = () => {
    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  function addCollaborators() {
    axios
      .put("/project/add-user", {
        projectId: location.state.elem._id,
        users: Array.from(selectedUsersId),
      })
      .then((res) => setIsModalOpen(false))
      .catch((err) => {
        console.log(err.message);
      });
  }

  function getCurrentCollaborators() {
    axios
      .get(`/project/get-project/${location.state.elem._id}`)
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  function send() {
    console.log("Sending Message");

    sendMessage("project-message", {
      message,
      sender: user._id,
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, user: user, type: "outgoing" },
    ]);

    setMessage("");
  }

  function writeAiMessage(message) {
    const messageObject = JSON.parse(message);
    return (
      <div className="overflow-auto bg-slate-900 text-white p-2 rounded-md">
        <Markdown className="text-sm">{messageObject.text}</Markdown>
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);

    if(!webContainer){

      getWebContainer().then(container=>{

        setWebContainer(container);
        console.log("Container Started");
      })
      .catch((err)=>{

        console.log(err.message);
      })
    }

    recieveMessage("project-message", async (data) => {
      console.log("Response Message: ", data);

      if (data.user._id === "ai") {
        const aiResponse = await data.text;
        const message = JSON.parse(aiResponse);
        console.log("Response Message after parsing: ", message);
        if (message.fileTree) {
          setOpenFiles([]);
          webContainer?.mount(message.fileTree);
          setFileTree(message.fileTree);
        }
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { ...data, type: "incoming" },
      ]);
    });

    fetchAllUsers();
    getCurrentCollaborators();
  }, []);

  const handleUserSelect = (id) => {
    setSelectedUsersId((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  return (
    <main className="h-screen w-full flex">
      <section className="relative left flex flex-col h-screen min-w-96 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-200">
          <button
            className="flex gap-2 cursor-pointer"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <i className="ri-add-fill mr-1"></i>
            <span>Add Collaborator</span>
          </button>

          <button
            className="p-2 cursor-pointer"
            onClick={() => {
              setIsSidePanelOpen(!isSidePanelOpen);
            }}
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="pt-1 pb-11 conversation-area flex flex-col flex-grow h-full overflow-hidden relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-2 overflow-y-auto"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message flex flex-col p-2 rounded-md w-fit 
                ${msg.user._id === "ai" ? "max-w-80" : "max-w-56"}
                ${
                  msg.type === "incoming"
                    ? "bg-slate-100"
                    : "ml-auto bg-slate-50"
                }
                `}
              >
                <small className="opacity-65 text-xs">{msg.user?.email}</small>
                {msg.user?._id === "ai" ? (
                  writeAiMessage(msg.text)
                ) : (
                  <p className="text-sm">{msg.text}</p> // Regular message
                )}
              </div>
            ))}
          </div>
          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              className="p-2 px-4 border-none outline-none bg-slate-200 rounded-tr-xl rounded-br-xl flex-grow"
              type="text"
              placeholder="Enter Message"
            />
            <button
              onClick={() => send()}
              className="px-5 bg-slate-950 text-white cursor-pointer"
            >
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center p-2 px-3 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              onClick={() => {
                setIsSidePanelOpen(!isSidePanelOpen);
              }}
              className="p-2 cursor-pointer"
            >
              <i className="ri-close-large-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div className="user flex gap-2 items-center cursor-pointer hover:bg-slate-200 p-2 transition-all duration-200">
                    <div className="aspect-square rounded-full w-fit h-fit flex justify-center items-center p-5 text-white bg-slate-500">
                      <i className="ri-user-fill absolute"></i>
                    </div>

                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right bg-red-50 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
          <div className="fileTree">
            {Object.keys(fileTree).map((file, index) => (
              <button
                onClick={() => {
                  setActiveFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                key={index}
                className="cursor-pointer tree-element p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
              >
                <p className="font-semibold text-lg">{file}</p>
              </button>
            ))}
          </div>
        </div>

        {activeFile && (
          <div className="code-editor flex flex-col flex-grow h-full">
            <div className="top flex justify-between w-full">
              <div className="flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFile(file)}
                  className={`w-fit cursor-pointer p-3 px-4 flex items-center gap-2 font-semibold ${
                    activeFile === file ? "bg-slate-300" : "bg-slate-100"
                  }`}
                >
                  <p className="text-black">{file}</p>
                </button>
              ))}
              </div>

              <div className="actions">
                <button
                onClick={async ()=>{
                  
                  await webContainer?.mount(fileTree);

                  const buildProcess = await webContainer?.spawn('npm' , ['install']);

                  buildProcess.output.pipeTo(new WritableStream({
                    write(chunk){
                      console.log(chunk)
                    }
                  }))

                  if(runProcess){

                    runProcess.kill()
                  }

                  const tempRunProcess = await webContainer?.spawn('npm' , ['start']);

                  tempRunProcess.output.pipeTo(new WritableStream({
                    write(chunk){
                      console.log(chunk)
                    }
                  }))

                  setRunProcess(tempRunProcess)

                  webContainer.on("server-ready" , (port , url)=>{
                    console.log(`PORT: ${port} , URL: ${url}`)
                    setIFrameUrl(url);
                  })
                }}
                className="px-4 py-3 bg-slate-300 text-black cursor-pointer"
                >
                  RUN
                </button>
              </div>

            </div>
            <div className="bottom flex flex-grow p-4 bg-gray-800 text-white outline-none">
              {fileTree[activeFile] && (
                <CodeMirror
                  value={fileTree[activeFile].file.contents}
                  extensions={[javascript({ jsx: true })]}
                  theme={dracula}
                  onChange={(newCode) =>
                    setFileTree({
                      ...fileTree,
                      [activeFile]: {
                        file:{
                        contents: newCode,

                        }
                      },
                    })
                  }
                  basicSetup={{
                    lineNumbers: true, // Show line numbers
                    foldGutter: true, // Enable code folding
                    highlightActiveLine: true, // Highlight the active line
                  }}
                  options={{
                    lineWrapping: true, // 🔥 Enable line wrapping for long lines
                  }}
                  height="620px"
                  className="text-lg overflow-auto whitespace-pre-wrap break-words w-full"
                ></CodeMirror>
              )}
            </div>
          </div>
        )}

        {iFrameUrl&&webContainer &&
          
          (<div className="flex min-w-96 flex-col h-full">

            <div className="address-bar">
              <input type="text" 
                onChange={(e)=>{setIFrameUrl(e.target.value)}}
                value={iFrameUrl}
                className="w-full p-2 px-4 bg-slate-200"
              />
            </div>
            <iframe src={iFrameUrl} className="w-full h-full"></iframe>


          </div>)
        }
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black opacity-90 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-96">
            <header className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4 text-center text-white">
                Select Collaborators
              </h2>
              <button
                className="text-white cursor-pointer"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                <i class="ri-close-large-fill"></i>
              </button>
            </header>
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    handleUserSelect(user._id);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-600 transition-all duration-100 ${
                    selectedUsersId.indexOf(user._id) !== -1
                      ? "bg-gray-600 "
                      : ""
                  }`}
                >
                  <button className="relative aspect-square rounded-full w-fit h-fit flex justify-center items-center p-5 text-white bg-slate-500">
                    <i className="ri-user-fill absolute"></i>
                  </button>
                  <span className="text-white">{user.email}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => addCollaborators()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-all duration-100"
              >
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
