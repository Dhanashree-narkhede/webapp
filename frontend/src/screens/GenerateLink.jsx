import React, { useState } from 'react';
import meet from './meet.png';
import { SlCamrecorder } from "react-icons/sl";
import { FaPlus } from "react-icons/fa";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';
import { toast} from 'react-hot-toast'

function GenerateLink() {
    const [meetingLink, setMeetingLink] = useState("zes-rswt-smw");
    
    // Function to generate a new meeting link
    const generateLink = () => {
        const newLink = `https://meet.app/${Math.random().toString(36).substring(2, 15)}`;
        setMeetingLink(newLink);
        toast.success('Meeting link generated and copied to clipboard!');
    }

    const css1 = "flex flex-col border border-gray-400 p-5 w-[35%] rounded-md";
    const css2 = "text-[20px] font-bold pb-2";
    const css3 = "flex flex-col";
    const color1 = "#03B1E8 #0170E9";
    
    return (
        <div>
            <div className='w-full'>
                <img src={meet} alt="meet" className='w-[140px] h-[100px]' />
            </div>
            <div className='px-10'> 
                <h1 className='text-[50px] font-bold'>Video Chat Application</h1>
                <div className=''>
                    <h1 className='font-semibold text-[28px] pb-2'>How our application works</h1>
                    <div className='flex gap-x-3'>
                        <span className={`${css1}`}>
                            <h2 className={`${css2}`}>Create Meeting link</h2>
                            <span className={`${css3}`}>
                                <span>1. Click on "Generate Link" button, the link is copied to clipboard automatically.</span>
                                <span>2. Share the link with colleagues.</span>
                            </span>
                        </span>
                        <span className={`${css1}`}>
                            <h2 className={`${css2}`}>Join the Meeting</h2>
                            <span className={`${css3}`}>
                                <span>1. Enter your Email Id.</span>
                                <span>2. Enter your Email Id.</span>
                                <span>3. Paste your meeting Link.</span>
                                <span>4. Click on Join, and Start the meeting or Join the meeting.</span>
                            </span>
                        </span>
                    </div>
                </div>
                <div className='flex px-5'>
                    <div className='py-5 px-5'>
                        <CopyToClipboard text={meetingLink}>
                            <button 
                                className='bg-blue-500 text-white rounded-md p-2 text-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300'
                                onClick={generateLink}
                            >
                                <span className='flex justify-center items-center gap-1'><SlCamrecorder />Generate Link</span>
                            </button>
                        </CopyToClipboard>
                    </div>
                    <div className='py-5'>
                        <Link to = "/looby">
                        <button className='bg-blue-500 text-white rounded-md p-2 text-md transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300'>
                            <span className='flex justify-center items-center gap-1'><FaPlus /> Join</span>
                        </button>
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default GenerateLink;
