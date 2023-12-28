import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt, faPenToSquare, faTable, faFloppyDisk, faForward, faPlus, faInfo,
    faBan, faGlobe, faUser, faShuffle, faMicrophone, faRetweet, faChartSimple, faVolumeHigh
} from '@fortawesome/free-solid-svg-icons';

const SpeakingHelp = ({helpShow, setHelpShow}) => {
    const dropdownStyle = {
        position: 'relative',
        display: 'inline-block',
        width: "40px"
    };

    const dropdownContentStyle = {
        display: helpShow ? 'block' : 'none', 
        position: 'absolute',
        backgroundColor: '#f9f9f9',
        width: '500px',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        padding: '12px 16px',
        zIndex: 1,
        "border-radius": "10px",
        textAlign: 'left'
    };
    return (
        <div>
            <button style={dropdownStyle} onMouseEnter={() => setHelpShow(true)} onMouseLeave={() => setHelpShow(false)} className="btn btn-sm btn-light text-center">
                <FontAwesomeIcon icon={faInfo} />
                <div class="text-left" style={dropdownContentStyle}>
                    <ul>
                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faTable} />
                            to link to your paragraph table.

                        </li>
                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faPenToSquare} />
                            to edit your paragraphs. <span class="text-danger"> You cannot edit the paragraphs created by other users.</span>
                        </li>
                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faTrashAlt} />
                            to delete your paragraphs. <span class="text-danger"> You cannot delete the paragraphs created by other users.</span>
                        </li>
                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faChartSimple} />
                            to show your statistic.

                        </li>
                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faUser} />
                            to show only your paragraphs or Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faGlobe} />
                            to show all paragraphs.

                        </li>
                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faShuffle} />
                            to randomly select a paragraph to practice.
                        </li>



                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faFloppyDisk} />
                            to save your edit.
                        </li>

                        <li class="my-3">
                            Press
                            <FontAwesomeIcon style={{ width: "40px" }} icon={faBan} />
                            to cancel your edit.
                        </li>
                        <li class="my-3">
                            Press
                            <button type="button" class="btn btn-outline-danger mx-2" >
                                <FontAwesomeIcon icon={faMicrophone} />
                            </button> or <span class="text-info">ENTER </span>
                            to mute your mic.
                        </li>
                        <li class="my-3">
                            Press
                            <button type="button" class="btn btn-outline-success mx-2" >
                                <FontAwesomeIcon icon={faMicrophone} />
                            </button> or <span class="text-info">ENTER </span>
                            to activate your mic.
                        </li>
                        <li class="my-3">
                            Press
                            <button type="button" class="btn btn-outline-success mx-2" >
                                <FontAwesomeIcon icon={faRetweet} />
                            </button> or <span class="text-info">R </span>
                            to reset your work.
                        </li>
                        <li class="my-3">
                            Press
                            <span class="text-info"> CTRL </span>
                            to hear the pronunciation of the next word.
                        </li>
                        <li class="my-3">
                            Press
                            <button type="button" class="btn btn-outline-info mx-2" >
                                <FontAwesomeIcon icon={faForward} />
                            </button> or <span class="text-info"> SHIFT </span>
                            to skip the next word.
                        </li>
                        {/* <li class="my-3">
                            Click a word in the paragraph to show its pronunciation and its meanings. Click
                            <button type="button" style={{ "border-radius": "50%" }} class="m-1 btn btn-outline-dark btn-sm">
                                <FontAwesomeIcon icon={faPlus} flip size="2xs" />
                            </button>
                            to save its meanings.
                        </li> */}
                        <li class="my-3">
                            Click a word in the paragraph to show its pronunciation.
                        </li>
                        <li class="my-3">
                            Words spoken <span class="text-success"><b>up to 5 times  </b> </span>are highlighted in <span class="text-success"><b>green</b></span>,
                            those spoken between <span class="text-info"><b>6 and 20 times</b>  </span>are highlighted in <span class="text-info"> <b> blue</b></span>.
                            Words repeated more than <span class="text-warning"><b>20 but less than 35 times</b>  </span>are in <span class="text-warning"><b>yellow</b></span>
                            , while those spoken between <span style={{ color: "#DC7633" }} ><b>35 and 50 times </b></span>are in <span style={{ color: "#DC7633" }} ><b>orange </b></span>.
                            Words that are <span class="text-danger"><b>not spoken and skipped </b> </span>  are marked in <span class="text-danger"><b>red </b> </span>.
                        </li>

                    </ul>
                </div>
            </button>

        </div>
    );
};

export default SpeakingHelp;
