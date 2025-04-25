import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { data } from 'react-router-dom';
import './Home.css'

export default function Home() {

    const[data,setData] = useState([])
    const[maxLevel,setmaxLevel] = useState()
    const[concepts,setConcepts] = useState([])

    useEffect(() => {
        const fetchCount = async () => {
          try {
            const res = await axios.get('http://localhost:5000/getTitle');
            setData(res.data.groups)
            setmaxLevel(res.data.total_levels)
          } catch (error) {
            console.error("Error fetching count:", error);
          }
        };
    
        fetchCount();
      }, []); 

      useEffect(() => {
        const fetchConcepts = async () => {
          try {
            const res = await axios.get('http://localhost:5000/getConcepts');
            setConcepts(res.data)
            
          } catch (error) {
            console.error("Error fetching count:", error);
          }
        };
    
        fetchConcepts();
      }, []); 

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Welcome to Pyspark</h2>

      <div className="row g-4">
        {/* Examples with explanation */}
        <div className="col-md-6">
            <div className="card h-100 border-info">
                <div className="card-header bg-info text-white fw-bold">Brief Explanation</div>
                <div className="card-body">
                {data.map(section => (
                  <div key={section.group}>
                    <h3>{section.group}</h3>
                    <ul>
                        {section.data.map(item => (
                            <li className='levels' key={item.level_id}>
                            <a className="level-link" href={`/level/${item.level_id}?max=${maxLevel}`}>
                            {item.rank}: {item.topic}
                            </a>
                            </li>
                        ))}
                    </ul>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* Exercise levels */}
        <div className="col-md-6">
            <div className="card h-100 border-warning">
                <div className="card-header bg-warning fw-bold">Important Pyspark Concepts</div>
                <div className="card-body">
                  {concepts.map(item => (
                    <div key={item.position}>
                      <p><b>{item.topic}</b></p>
                      <ul>
                        {item.concept.map((conceptItem,ind) => (
                          <li className='levels' key={ind}>
                            {ind + 1} : {conceptItem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {/* Practice Data 
                  {data.map(section => (
                    <div key={section.group}>
                    <h3>{section.group}</h3>
                      {section.data.map(item => (
                        <li className='levels'  key={item.level_id}>
                        <a className="level-link" href={`/level/${item.level_id}?max=${maxLevel}`}>
                            Practice {item.rank}: {item.mission}
                        </a>
                        </li>
                      ))} 
                    </div>
                  ))}  */}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
