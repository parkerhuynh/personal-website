
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../components/AuthContext.js';
import ReactLoading from 'react-loading';
import axios from 'axios';
import { SpeakingStatisticData } from './SpeakingStatisticData.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
const MICSIZE = 50
const IMG_MIC_SIZE = MICSIZE * .8

function SpeakingStatistic() {
  const { currentUser } = useAuth();
  const { userInfo, isLoading, diffWordDurMisspel, skipCountWords,
    totalSpeakingPerDay, doneCounts, skipCountPerDay, DataAnalysis, dailyAvergePerWord} = SpeakingStatisticData(currentUser);

  const [day, setDay] = useState(3)
  const [hardWord, setHardWord] = useState(10)
  const [skipWord, setSkipWord] = useState(10)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'rgb(23, 32, 42)', border: 'black' }}>
          <p className="label">{`Name: ${label}`}</p>
          <p className="intro">{`Value: ${payload[0].value} s`}</p>
          <div>
            <div>Speaking Words:</div>
            {payload[0].payload.speaking_word.map((word, index) => (
              (index !== 0 && index % 5 === 0) ? <><br key={'br-' + index} /><span key={index}>{word + " "}</span></> : <span key={index}>{word + " "}</span>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const handleSelectDayChange = (e) => {
    const selectedValue = e.target.value;
    DataAnalysis(userInfo.id, selectedValue)
    setDay(selectedValue);
  };

  const handleSelectHardWordChange = (e) => {
    const selectedValue = e.target.value;
    setHardWord(selectedValue);
  };
  const handleSelectSkipWordChange = (e) => {
    const selectedValue = e.target.value;
    setSkipWord(selectedValue);
  };
  const diffWordDurMisspelFilter = diffWordDurMisspel.slice(0, hardWord)
  const skipCountWordsFilter = skipCountWords.slice(0, skipWord)
  return (
    <div className={'background-image-repeat'}>
      <div className="container p-0">
        {/* --------------------------------------------------------------------------------------- */}
        {!currentUser ? (
          <div className="pt-5 text-center">
            <h1 className="text-danger pb-5">Warning!</h1>
            <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
            <h5 className="text-light"> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
          </div>
        ) : (
          <div class="text-light">
            <h3 class="text-center py-5">Speaking Statistic</h3>
            {isLoading ? (null) : (
              <div style={{ backgroundColor: 'rgb(0, 1, 2, 0.5)' }}>
                <div class="row d-flex justify-content-end p-2">
                  <div class="col-2">
                    <select value={day} style={{ backgroundColor: "transparent" }} onChange={handleSelectDayChange} class="form-select form-select-sm text-light" aria-label=".form-select-sm example">
                      <option class="text-dark" value="3">3 days</option>
                      <option class="text-dark" value="7">1 week</option>
                      <option class="text-dark" value="14">2 weeks</option>
                      <option class="text-dark" value="21">3 weeks</option>
                      <option class="text-dark" value="30">1 month</option>
                      <option class="text-dark" value="60">2 months</option>
                      <option class="text-dark" value="90">3 months</option>
                      <option class="text-dark" value="180">6 months</option>
                      <option class="text-dark" value="365">1 year</option>
                      <option class="text-dark" value="all">All</option>
                    </select>
                  </div>
                </div>
                {/* --------------------------Daily summary-------------------------- */}
                <div class="row py-3 border-bottom border-warning pb-3 m-0">
                  <div class="col-1"> </div>
                  <div class="col-11">
                    <h5 class="text-center">Daily Word Count and Success Rate</h5>
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={totalSpeakingPerDay} >
                      <CartesianGrid strokeDasharray="5 20" stroke="#ccc" />
                        <XAxis dataKey="date" stroke="white"
                          height={90}
                          tick={{
                            fill: 'white',
                            angle: -60, // Rotate labels to -45 degrees
                            textAnchor: 'end' // Align the end of the label with the tick
                          }}
                          // padding={{ left: 10, right: 10 }} 
                          />
                        <YAxis tick={{ fill: 'white' }} stroke="white" yAxisId="left" width={100}
                          label={{ value: 'Word Count', angle: -90, fill: 'white' }} />
                        <YAxis
                          yAxisId="right"
                          width={100}
                          tickFormatter={(value) => value.toFixed(2)}
                          label={{ value: 'Success Rate', angle: 90, fill: 'white' }}
                          domain={['auto', 1]}
                          orientation="right"
                          tick={{ fill: 'white' }}

                          stroke="white"
                        />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" name="Speaking Word" dataKey="total_speaking" yAxisId="left" stroke="#B03A2E" activeDot={{ r: 8 }} strokeWidth={2} />
                        <Line type="monotone" name="Correct Word" dataKey="true_spelling" yAxisId="left" stroke="#1E8449" activeDot={{ r: 8 }} strokeWidth={2} />
                        <Line type="monotone" name="Success Rate" dataKey="successRate" yAxisId="right" stroke="#2874A6" activeDot={{ r: 8 }} strokeWidth={2}
                          strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>

                <div class="row py-3 border-bottom border-warning pb-3 m-0">
                  <div class="col-1"> </div>
                  <div class="col-10 ">
                    <h5 class="text-center">Daily Average Duration per Word</h5>
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={dailyAvergePerWord} >
                      <CartesianGrid strokeDasharray="5 20" stroke="#ccc" />
                        <XAxis dataKey="date" stroke="white"
                          height={90}
                          tick={{
                            fill: 'white',
                            angle: -60, // Rotate labels to -45 degrees
                            textAnchor: 'end' // Align the end of the label with the tick
                          }}
                          // padding={{ left: 10, right: 10 }} 
                          />
                        <YAxis tick={{ fill: 'white' }} stroke="white" yAxisId="left" width={100}
                          label={{ value: 'Average duration per word (second)', angle: -90, fill: 'white' }} />
                        <Tooltip />
                        <Line type="monotone" name="Average Duration" dataKey="duration" yAxisId="left" stroke="#1E8449" activeDot={{ r: 8 }} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div class="col-1"> </div>
                </div>


                <div class="row m-0">
                  <div class="col-6 border-bottom border-end border-warning py-5 ps-1 pe-3">
                    <h5 class="text-center">Daily Completed Count</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={doneCounts} >
                      < CartesianGrid strokeDasharray="2 20" stroke="#ccc" />
                        <XAxis dataKey="date" stroke="white"
                          height={90}
                          tick={{
                            fill: 'white',
                            angle: -60, // Rotate labels to -45 degrees
                            textAnchor: 'end' // Align the end of the label with the tick
                          }}/>
                        <YAxis tick={{ fill: 'white' }} stroke="white" yAxisId="left" width={100}
                          label={{ value: 'Completed Count', angle: -90, fill: 'white' }} />
                        <Tooltip />
                        <Line type="monotone" name="Completed Time" dataKey="count" yAxisId="left" stroke="#1E8449" activeDot={{ r: 8 }} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div class="col-6 border-bottom border-warning py-5 ps-1 pe-4">
                    <h5 class="text-center">Daily Skip Word Count</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={skipCountPerDay} >
                      <CartesianGrid strokeDasharray="2 20" stroke="#ccc" />
                        <XAxis dataKey="date" stroke="white"
                          height={90}
                          tick={{
                            fill: 'white',
                            angle: -60, // Rotate labels to -45 degrees
                            textAnchor: 'end' // Align the end of the label with the tick
                          }}
/>
                        <YAxis tick={{ fill: 'white' }} stroke="white" yAxisId="left" width={100}
                          label={{ value: 'Skip Word Count', angle: -90, fill: 'white' }} />
                        <Tooltip />
                        <Line type="monotone" name="Completed Time" dataKey="count" yAxisId="left" stroke="#B03A2E" activeDot={{ r: 8 }} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>

                {/* --------------------------HARD WORDS-------------------------- */}
                <div class="row  m-0">
                  <div class="col-6 border-bottom border-end border-warning py-5 ps-1 pe-3">
                    <div class="d-flex justify-content-end">
                      <div class="col-3">
                        <select value={hardWord} style={{ backgroundColor: "transparent" }} onChange={handleSelectHardWordChange} class="form-select form-select-sm text-light" aria-label=".form-select-sm example">
                          <option class="text-dark" value="10"> 10 words </option>
                          <option class="text-dark" value="20"> 20 words </option>
                          <option class="text-dark" value="30"> 30 words </option>
                          <option class="text-dark" value="40"> 40 words </option>
                          <option class="text-dark" value="50"> 50 words </option>
                        </select>
                      </div>
                    </div>

                    <h5 class="text-center">Hardest Speaking Words</h5>
                    <ResponsiveContainer width="100%" height={diffWordDurMisspelFilter.length * 50}>
                      <BarChart data={diffWordDurMisspelFilter} layout="vertical">
                        <XAxis height={50} type="number" tick={{ fill: 'white' }}
                          label={{ value: 'million seconds', corlor: "white", position: 'insideBottom', style: { fill: 'white' } }} />
                        <YAxis dataKey="word" type="category" tick={{ fill: 'white' }} width={100} />
                        <Tooltip
                          content={<CustomTooltip />}
                        />
                        <Bar dataKey="duration" fill="#F2F3F4" barSize={(diffWordDurMisspelFilter.length * 50) / diffWordDurMisspelFilter.length} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div class="col-6 border-bottom border-warning py-5 ps-1 pe-4">
                  <div class="d-flex justify-content-end">
                      <div class="col-3">
                        <select value={skipWord} style={{ backgroundColor: "transparent" }} onChange={handleSelectSkipWordChange} class="form-select form-select-sm text-light" aria-label=".form-select-sm example">
                          <option class="text-dark" value="10"> 10 words </option>
                          <option class="text-dark" value="20"> 20 words </option>
                          <option class="text-dark" value="30"> 30 words </option>
                          <option class="text-dark" value="40"> 40 words </option>
                          <option class="text-dark" value="50"> 50 words </option>
                        </select>
                      </div>
                    </div>
                    <h5 class="text-center">Most Skip Words</h5>
                    <ResponsiveContainer width="100%" height={(skipCountWordsFilter.length * 50)}>
                      <BarChart data={skipCountWordsFilter} layout="vertical">
                        <XAxis height={50} type="number" tick={{ fill: 'white' }}
                          label={{ value: 'Skip Time', corlor: "white", position: 'insideBottom', style: { fill: 'white' } }} />
                        <YAxis dataKey="word" type="category" tick={{ fill: 'white' }} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgb(23, 32, 42)', // Tooltip background color
                            borderColor: 'black', // Tooltip border color
                            color: 'white' // Text color inside the tooltip
                          }}
                        />
                        <Bar dataKey="count" fill="#F2F3F4" barSize={(skipCountWordsFilter.length * 50) / skipCountWordsFilter.length} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div class="p-5"> </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default SpeakingStatistic;