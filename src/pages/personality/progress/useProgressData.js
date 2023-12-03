import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const useProgressData = (currentUser, dayhistory) => {
    // Define state variables
    const [progress, setProgress] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [currentUser, dayhistory]);

    const fetchUserData = async () => {
        if (!currentUser) return;
        // setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);
            const progressResponse = await axios.get(`/get_progress/${userInfoResponse.data.id}/${dayhistory}`);
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
            const new_created_at_value = moment(item.created_at, "DD-MM-YYYY hh:mm:ss Z")
            const date_render = `${new_created_at_value.format('ddd')}, ${new_created_at_value.format("YYYY-MM-DD")}`
            const date = `${new_created_at_value.format("YYYY-MM-DD")}`
            const time = `${new_created_at_value.format("HH:mm:ss")}`
            return {
                ...item,
                created_at: new_created_at_value,
                date: date,
                time: time,
                date_render: date_render,
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
        console.log(action)
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
                    console.log(resizedAction)
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