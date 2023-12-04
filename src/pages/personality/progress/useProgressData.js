import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const useProgressData = (currentUser) => {
    // Define state variables
    const [progress, setProgress] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const fetchUserData = async () => {
        if (!currentUser) return;
        // setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);
            const progressResponse = await axios.get(`/get_progress/${userInfoResponse.data.id}`);
            setProgress(processProgressData(progressResponse.data));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const processProgressData = (data) => {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        data = data.map((item) => {
            var original_tz_st =  moment.tz(`${item.created_at}`, "YYYY-MM-DD HH:mm:ss", "Australia/Sydney").format()
            const current_tz_date = moment(original_tz_st)
            const date_render = `${current_tz_date.format('ddd')}, ${current_tz_date.format("DD-MM-YYYY")}`
            const date = `${current_tz_date.format("DD-MM-YYYY")}`
            const time = `${current_tz_date.format("HH:mm:ss")}`

            var newdatatime =  moment(current_tz_date)
            var today =  moment(new Date().date)
            console.log(today)
            // const differenceInHours = (defOffset - orOffset) / 60;
            console.log(today.diff(newdatatime, 'days'))
            return {
                ...item,
                created_at: current_tz_date,
                date: date,
                time: time,
                date_render: date_render,
                gap:  Math.floor(today.diff(newdatatime, 'days'))
            };
        });
        return data;
    };

    function resizeImageToMaxDimension(width, height, maxDimension) {
        // Calculate the aspect ratio
        const aspectRatio = width / height;

        // Determine new dimensions
        let newWidth, newHeight;

        if (width > height) {
            // If width is the larger dimension
            newWidth = Math.min(width, maxDimension);
            newHeight = newWidth / aspectRatio;
        } else {
            // If height is the larger dimension or if width and height are equal
            newHeight = Math.min(height, maxDimension);
            newWidth = newHeight * aspectRatio;
        }

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
                    let new_dimens = resizeImageToMaxDimension(img.width, img.height, 500);
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


    return { userInfo, progress, setProgress, fetchUserData, isLoading, quillInputHandel };
};