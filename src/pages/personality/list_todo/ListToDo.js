import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment-timezone';
import { useAuth } from '../../../components/AuthContext';
import delete_logo from "./delete.png"
import add_logo from "./add.png"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

function App() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [newDate, setNewDate] = useState(new Date());
    const [userInfo, setUserInfo] = useState({});
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editField, setEditField] = useState(null);

    const MICSIZE = 25
    const IMG_MIC_SIZE = MICSIZE * .8
    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const fetchUserData = async () => {
        if (!currentUser) return;
        // setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);
            const response = await axios.get(`/get_list_todo/${userInfoResponse.data.id}`);
            const list_todo_tasks = response.data
            const processed_tasks = list_todo_tasks.map(item => (process_data_list_to_do(item)))
            setTasks(processed_tasks);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const process_data_list_to_do = (item) => {
        item.processed_date = moment(item.date).utc().toDate()
        return item
    }
    function generateRandomCode() {
        return [...Array(12)].map(() => Math.random().toString(36)[2]).join('');
    }

    const addTask = () => {
        if ((newTask == "<p><br></p>") || (newTask == "")) {
            alert("Input the tasks")
        } else {
            const taskData = {
                date: moment(newDate).format("YYYY-MM-DD"),
                task: newTask.replace(/<br\s*\/?>/gi, ''),
                user_id: userInfo.id,
                task_id: generateRandomCode()

            };
            axios.post('/add_task', taskData)
                .then(response => {
                    setTasks([...tasks, { ...taskData, complete: false }]);
                    setNewTask("");
                    setNewDate(new Date());
                }
                )
                
                .catch(error => console.error(error));
        }
    };
    const startEditing = (id, field) => {
        setEditField(field)
        setEditingTaskId(id);
    };
    function resizeImageToMaxDimension(width, height, maxDimension) {
        // Calculate the aspect ratio
        const aspectRatio = width / height;

        // Determine new dimensions
        let newWidth, newHeight;

        // If width is the larger dimension or if width and height are equal
        newWidth = Math.min(width, maxDimension);
        newHeight = newWidth / aspectRatio;

        // Ensuring that dimensions are integers
        newWidth = Math.round(newWidth);
        newHeight = Math.round(newHeight);

        return { newWidth, newHeight };
    }

    function quillInputHandel(action, callback) {
        // Check if the action string contains an <img> tag
        if (action.includes("<img")) {
            // Create a new Image object
            let img = new Image();

            // Extract the image source from the action string
            let srcMatch = action.match(/<img src="(.*?)"/);
            if (srcMatch && srcMatch[1]) {
                img.src = srcMatch[1];

                // Once the image is loaded, calculate the new dimensions
                img.onload = function () {
                    let new_dimens = resizeImageToMaxDimension(img.width, img.height, 1000);
                    let resizedAction = action.replace("<img", `<img width="${new_dimens.newWidth}" height="${new_dimens.newHeight}"`);
                    // Execute the callback function with the resized action
                    callback(resizedAction);
                };
            } else {
                // If no image source is found, return the original action
                callback(action);
            }
        } else {
            // If no <img> tag is found, return the original action
            callback(action);
        }
    }
    const handleInputChange = (e) => {
        quillInputHandel(e, (progress) => {
            setNewTask(progress);
        });
    };

    const handleKeyPress = (e) => {
        // Check if 'Enter' is pressed without the 'Shift' key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents the default action of the Enter key in a textarea (new line)
            addTask();
        }
    };

    const handleDateChange = (date, item) => {
        const update_date = moment(date).format("YYYY-MM-DD")
        const uppdate_task = {
            ...item,
            date: update_date,
        };
        const updatedTasks = tasks.map(task => {
            if (task.id === item.id) {
                return { ...task, date: update_date, processed_date: moment(update_date).utc().toDate() };
            }
            return task;
        });
        axios.post('/update_task', uppdate_task)
            .then(response => {
                setTasks(updatedTasks);
                setNewTask("");
                setNewDate(new Date());
                setEditingTaskId(null)
            })
            .catch(error => console.error(error));
    };

    const handleCompletedChange = (item) => {
        var check_value = !item.complete
        check_value = check_value ? 1 : 0;
        const uppdate_task = {
            ...item,
            complete: check_value
        };

        const updatedTasks = tasks.map(task => {
            if (task.task_id === item.task_id) {
                return { ...task, complete: check_value };;
            }
            return task;
        });
        axios.post('/update_task', uppdate_task)
            .then(response => {
                setTasks(updatedTasks);
                setNewTask("");
                setNewDate(new Date());
                setEditingTaskId(null)
            })
            .catch(error => console.error(error));
    };

    const handleTaskChange = (e, item) => {
        quillInputHandel(e, (progress) => {
            const uppdate_task = {
                ...item,
                task: progress
            };
            const updatedTasks = tasks.map(task => {
                if (task.id === item.id) {
                    return uppdate_task;
                }
                return task;
            });
            axios.post('/update_task', uppdate_task)
                .then(response => {
                    setTasks(updatedTasks);
                    setNewTask("");
                    setNewDate(new Date());
                })
                .catch(error => console.error(error));
        });
    };

    const handleSave = () => {
        setEditField(null)
        setEditingTaskId(null);
    }
    // const groupByDate = (list_todoArray) => {
    //     const groups = list_todoArray.reduce((acc, item) => {
    //         const date = item.date;
    //         if (!acc[date]) {
    //             acc[date] = [];
    //         }
    //         acc[date].push(item);
    //         return acc;
    //     }, {});

    //     return Object.keys(groups).map((date) => {
    //         return {
    //             date,
    //             items: groups[date],
    //         };
    //     });
    // };
    const groupByDate = (list_todoArray) => {
        const groups = list_todoArray.reduce((acc, item) => {
            const date = item.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});
    
        return Object.keys(groups).map((date) => {
            return {
                date,
                items: groups[date].sort((a, b) => {
                    // Sort by completion status first, then by date
                    if (a.complete === b.complete) {
                        return moment(a.date).diff(moment(b.date));
                    }
                    return a.complete ? 1 : -1;
                }),
            };
        });
    };

    const deleteTask = (item) => {
        axios.post(`/delete_tasks/${item.task_id}`)
            .then(response => {
                setTasks(tasks.filter(task => task.task_id !== item.task_id));
            })
            .catch(error => console.error(error));
    };
    var sortedTasks = tasks.sort((a, b) => moment(b.date) - moment(a.date))
    const groupedListToDo = groupByDate(sortedTasks);
    const groupStripedStyle = (index, task) => {
        // Start and end of the current week
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment().endOf('week');

        // Task date
        const taskDate = moment(task.date);
        const today = moment().format('YYYY-MM-DD')
        let backgroundColor;
        if (taskDate.isBefore(startOfWeek)) {
            // Color for dates before this week
            if ((task.complete === 0) || (task.complete === false)) {
                // Color for incomplete tasks
                backgroundColor = 'rgba(241, 196, 15, 0.8)';
            } else {
                // Color for completed tasks
                backgroundColor = 'rgba(241, 196, 15, 0.3)'
            }

        } else if (taskDate.isAfter(endOfWeek)) {
            // Color for dates in the next weeks
            backgroundColor = 'rgba(20, 143, 119, 0.7)';

        } else {
            if (taskDate.format('YYYY-MM-DD') === today) {
                if ((task.complete === 0) || (task.complete === false)) {
                    backgroundColor = 'rgba(41, 128, 185, 0.3)';
                } else {
                    backgroundColor = 'rgba(46, 204, 113, 0.7)';
                }
            }
            else if (taskDate.isBefore(today, 1)) {
                if ((task.complete === 0) || (task.complete === false)) {
                    backgroundColor = 'rgba(231, 76, 60, 0.3)';
                }
                else {
                    backgroundColor = 'rgba(46, 204, 113, 0.7)';
                }

            } else {
                backgroundColor = index % 2 === 0 ? 'rgb(0, 1, 2, 0.5)' : 'rgb(52, 73, 94 , 0.5)';
            }

        }

        return { backgroundColor };
    };
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                {
                    color: ['red',
                        'blue',
                        'yellow',
                        'white',
                        'green',
                        'orange',
                        'pink',
                        'purple',
                        'lime',
                        'magenta',
                        'cyan',
                        'silver',
                        'gold',
                        'teal',
                        'turquoise',
                        'lavender',
                        'coral'],
                },
            ],
            ['code-block', 'image'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['formula'],

        ],
        clipboard: {
            // Extend clipboard module to handle mixed content better
            matchVisual: false,
        },
        formula: true,
    };
    return (
        <div className="background-image-repeat">
            <div className="container">
                <div className="py-3">
                    <div class="py-3">
                        <DatePicker
                            selected={newDate}
                            onChange={date => setNewDate(date)}
                            className="form-control"
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>
                    {/* <textarea
                        className="form-control mt-2"
                        placeholder="New Task"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        rows="3" // You can adjust the number of rows as needed
                    ></textarea> */}
                    <ReactQuill
                        theme="snow"
                        value={newTask}
                        onChange={handleInputChange}
                        modules={modules}
                        onKeyDown={handleKeyPress}
                    />

                    <div class="d-flex justify-content-center mt-3">
                        <button type="button" onClick={addTask} class="btn btn-outline-success p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": 50, "height": 50 }}>
                            <img src={add_logo} style={{ "border-radius": "50%", "width": 50 * 0.8, "height": 50 * 0.8 }} />
                        </button>

                    </div>

                </div>
                <table className="table table-bordered table-dark ">
                    <thead>
                        <tr>
                            <th style={{ width: "200px" }} class="text-center">Date</th>
                            <th style={{ width: "100px" }} class="text-center">Complete</th>
                            <th class="text-center">Task</th>
                            <th style={{ width: "50px" }} class="text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedListToDo.map((group, groupIndex) =>
                            group.items.map((task, index) => (
                                <tr style={groupStripedStyle(groupIndex, task)}>
                                    {index === 0 && (
                                        <td rowSpan={group.items.length} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            {moment(task.date).format('dddd')} {moment(group.date).format('DD/MM/YYYY')}
                                        </td>
                                    )}
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                style={{ width: "100px" }}
                                                checked={task.complete}
                                                onChange={() => handleCompletedChange(task)}
                                            />
                                    </td>
                                    <td class="text-center" onDoubleClick={() => startEditing(task.id, "task")}>


                                        {((editingTaskId == task.id) & (editField == "task")) ? (
                                            <div>
                                                <div>
                                                    <DatePicker
                                                        style={{ width: "100px"}}
                                                        className="form-control"
                                                        selected={task.processed_date}
                                                        onChange={date => handleDateChange(date, task)}
                                                        dateFormat="yyyy-MM-dd"
                                                    />
                                                </div>
                                                <div class="pt-3">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={task.task}
                                                        onChange={e => handleTaskChange(e, task)}
                                                        modules={modules}
                                                    />
                                                </div>
                                                {/* <textarea
                                                    className="form-control mt-2"
                                                    placeholder="New Task"
                                                    value={task.task}
                                                    onChange={e => handleTaskChange(e, task)}
                                                    rows="3"
                                                ></textarea> */}
                                                <button className="btn btn-light mt-3 btn-sm" onClick={handleSave}>save</button>
                                            </div>
                                        ) : (
                                            <div class="text-left" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.task) }} />
                                        )}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class="text-center">
                                        <button type="button" onClick={() => deleteTask(task)} class="btn btn-outline-danger p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": MICSIZE, "height": MICSIZE }}>
                                            <img src={delete_logo} style={{ "border-radius": "50%", "width": IMG_MIC_SIZE, "height": IMG_MIC_SIZE }} />
                                        </button>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;
