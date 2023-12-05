import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const usePaperData = (currentUser) => {
    // Define state variables
    const [paper, setPaper] = useState([]);
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
            const paperResponse = await axios.get(`/get_papers/${userInfoResponse.data.id}`);
            setPaper(processPaperData(paperResponse.data));
            console.log(paperResponse.data)
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const processPaperData = (data) => {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        data = data.map((item) => {
            return item
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

    function quillInputHandel(quill_name, action, callback) {
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
                    let new_dimens = resizeImageToMaxDimension(img.width, img.height, 800);
                    let resizedAction = action.replace("<img", `<img width="${new_dimens.newWidth}" height="${new_dimens.newHeight}"`);
                    // Execute the callback function with the resized action
                    callback(resizedAction, quill_name);
                };
            } else {
                // If no image source is found, return the original action
                callback(action, quill_name);
            }
        } else {
            // If no <img> tag is found, return the original action
            callback(action, quill_name);
        }
    }


    return { userInfo, paper, setPaper, fetchUserData, isLoading, quillInputHandel };
};