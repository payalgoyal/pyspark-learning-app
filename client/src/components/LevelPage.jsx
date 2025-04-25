import React, {useEffect, useState} from 'react'
import { fetchLevelData } from '../api/api'
import { Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

import HintBox from './hintBox';
import SolutionBox from './solutionBox'

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";

const LevelPage = () => {
    const navigate = useNavigate()

    const { levelId } = useParams();
    const [levelData, setLevelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userCode, setUserCode] = useState('');
    const [output, setOutput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [hintTrigger, setHintTrigger] = useState(false);
    const [solutionTrigger, setSolutionTrigger] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const currentLevel = parseInt(levelId)

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    console.log("queryParams      ",queryParams)
    const maxLevel = parseInt(queryParams.get("max"));

    console.log("Maximum in level Page",maxLevel)
    const handleRunCode = async () => {
        try {
          setOutput('');
          setErrorMsg('');
          console.log("Code:", userCode, "Level ID:", levelId);
          const res = await axios.post('http://localhost:5000/execute', {
            code: userCode,
            levelId: levelId
          });
         
          setOutput(res.data.output)
          /*setOutput(JSON.stringify(res.data.output, null, 2));*/

          if (res.data.isCorrect) {
            console.log("✅ Correct Output");
          } else {
            console.log("❌ Incorrect Output");
          }
        } catch (err) {
          console.error(err);
          setErrorMsg(err.response?.data?.error || "Error executing code.");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
            const res = await fetchLevelData(levelId);
            const raw = res.data;
            console.log("Passed data ",raw)
            setLevelData({
                mission: raw.mission,
                explain: raw.explain,
                hint: raw.hint,
                solution: raw.solution,
                dataset: raw.dataset
            });
            } catch (err) {
            setError("Level not found or server error.");
            } finally {
            setLoading(false);
            }
        };

        loadData();
    }, [levelId]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="text-danger text-center mt-5">{error}</div>;

    const { mission, explain, hint,solution } = levelData;
    

    return (
        <div className="container py-4">
            <div style={{width:"100%"}}>
                <button onClick={() => navigate('/')} style={{ margin: '10px',float:'right'}}>
                    Home
                </button>
            </div>

            <div style={{width:"100%"}}> 
                <button onClick={() => navigate(`/level/${currentLevel + 1}?max=${maxLevel}`)}
                     style={{ margin: '10px',float:'right'}}
                     disabled={currentLevel >= maxLevel}>
                    Next
                </button>

                <button onClick={() => navigate(`/level/${currentLevel - 1}`)} 
                style={{ margin: '10px',float:'right'}}
                disabled={currentLevel - 1 < 1}>
                    Previous
                </button>

                <h2 className="mb-4 text-primary">🧩 Level {levelId}: </h2>
            </div>
            
            {/* Mission */}
            <div className="row g-4 my-5">
            <div className="col-md-4">
                <div className="card h-100 border-info">
                    <div className="card-header bg-info text-white fw-bold">Mission Brief</div>
                    <div className="card-body">
                        <p><b>Explanation: </b>{explain}</p>
                        <p><b>Practice: </b>{mission}</p>

                        <button onClick={()=> setHintTrigger(!hintTrigger)} style={{ margin: '10px' }}>
                            Hint
                        </button>

                        <button onClick={()=> setSolutionTrigger(!solutionTrigger)} style={{ margin: '10px' }}>
                            Solution
                        </button>
                        
                        <HintBox hintTrigger={hintTrigger} hint={hint} />
                        
                        <SolutionBox solutionTriggerParam={solutionTrigger} solutionParam={solution} />

                    </div>
                </div>
            </div>

            {/*Dataset */}
            <div className="col-md-4">
                <div className="card h-100 border-warning">
                    <div className="card-header bg-warning fw-bold">Dataset Preview</div>
                    <div className="card-body">
                        <div className="table-responsive">
                        {Object.entries(levelData.dataset).map(([fileName, dataArray]) => (
                            <div key={fileName} style={{ marginBottom: "30px" }}>
                                <h3>{fileName}</h3>
                                <table className="table table-bordered table-striped">
                                <thead className="table-dark">
                                    <tr>
                                        {dataArray.length > 0 &&
                                            Object.keys(dataArray[0]).map((key) => (
                                            <th key={key}>{key}</th>
                                        ))}
                                        {/*{Array.isArray(dataset) && dataset.length > 0 &&
                                            Object.keys(dataset[0]).map((key) => <th key={key}>{key}</th>)
                                        }*/}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataArray.map((row, index) => (
                                        <tr key={index}>
                                            {Object.keys(row).map((key) => (
                                            <td key={key}>
                                                {row[key] === '' || row[key] === "''" ? null : row[key]}
                                            </td>
                                            ))}
                                        </tr>
                                        ))}
                                   {/*} {dataset.map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
                                        </tr>
                                    ))}*/}
                                </tbody>
                            </table>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            </div>
            
            {/* Code Editor */}
            <div className="col-md-4">
                <div className="card h-100 border-secondary">
                    <div className="card-header bg-dark text-white fw-bold">Write Your Python Code Here</div>
                        <div className="card-body p-0">
                            <AceEditor
                                mode="python"
                                theme="monokai"
                                name="code-editor"
                                value={userCode}
                                onChange={setUserCode}
                                width="100%"
                                height="40%"
                                fontSize={14}
                                setOptions={{ useWorker: false }}
                            />

                            <button onClick={handleRunCode} style={{ margin: '10px'}}>
                                Run Code
                            </button>

                            {/* Output */}
                            
                            <div className="card border-secondary" style={{width:'100%',height:'35%',bottom:'0px',position:'absolute'}}>
                                <div className="card-header bg-warning text-white fw-bold">Result</div>
                                <div className="card-body p-0">
                                    {output && (
                                        <div style={{margin : '10px'}}>
                                            <h4>✅ You are Right: </h4>
                                            
                                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                                Show result table
                                            </button>

                                            {/* Modal */}
                                            {showModal && (
                                                <div
                                                style={{
                                                    position: 'fixed',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 9999,
                                                }}>

                                                <div
                                                    style={{
                                                    backgroundColor: 'white',
                                                    padding: '20px',
                                                    borderRadius: '8px',
                                                    maxHeight: '80%',
                                                    overflowY: 'auto',
                                                    width: '90%',
                                                    maxWidth: '800px',
                                                    }}>

                                                    <div style={{display:'flex', justifyContent: 'space-between',}}>
                                                        <h4>📊 Output Table</h4>
                                                        <button
                                                        className="btn btn-danger"
                                                        style={{ float: 'right', marginBottom: '10px' }}
                                                        onClick={() => setShowModal(false)}
                                                        >
                                                        X
                                                        </button>
                                                    </div>
                                                    

                                                    {/* Tabular Output */}
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered table-striped">
                                                            <thead className="table-dark">
                                                                <tr>
                                                                {Object.keys(output[0]).map((col) => (
                                                                    <th key={col}>{col.toUpperCase()}</th>
                                                                ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                            {output.map((row, idx) => (
                                                                <tr key={idx}>
                                                                    {Object.keys(output[0]).map((col) => (
                                                                    <td key={col}>{row[col]}</td>
                                                                    ))}
                                                                </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    </div>
                                                </div>
                                            )}

                                    {/* <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre> */}
                                        </div>

                                        )}

                                    {errorMsg && (
                                        <div style={{ color: 'red', margin : '10px' }}>
                                        <h4>❌ Check you code again</h4>
                                        <pre>{errorMsg}</pre>
                                        </div>
                                    )}
                                             
                                 </div>
                            </div>
            
                        </div>
                </div>
            </div>

        </div>
        </div>
      );
    };
    
    export default LevelPage;