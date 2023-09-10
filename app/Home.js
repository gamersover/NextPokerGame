"use client";

import { GameButton, Modal, BackDrop, CloseIcon, UserSettingIcon, AddIcon } from "@/components"
import { useEffect, useRef, useState } from "react"
import NextImage from "next/image"
import { useLocalStorage } from "@/utils/hooks";

function HomeTitle() {
    return (
        <div className="h-16 flex justify-center items-center">
            <p className="font-bold text-3xl">四人纸牌-找朋友</p>
        </div>
    )
}

function HomeImage() {
    return (
        <div className="flex-1 flex h-[50%] justify-center items-center">
            <NextImage src="/logo2.svg" priority alt="logo" width={0} height={0} className="w-full h-full" />
        </div>
    )
}

function UserProfilePanel({ avatar, username, handleUserNameChanged, handleAvatarSelected, showAvatars, handleShowAvatars }) {
    const imageList = Array.from(new Array(50)).map((_, index) => {
        return `/avatars/Avatars Set Flat Style-${String(index + 1).padStart(2, '0')}.png`
    })
    const [showInputError, setShowInputError] = useState(false)
    const [avatars, setAvatars] = useState(imageList)
    const fileInputRef = useRef(null)


    function handleInputChanged(e) {
        const userName = e.target.value
        const sanitizedValue = userName.replace(/[\u4e00-\u9fa5]/g, '__')
        if (sanitizedValue.length <= 10) {
            handleUserNameChanged(userName)
            setShowInputError(false)
        }
        else {
            setShowInputError(true)
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0]; // 获取用户选择的文件
        if (file) {
            const reader = new FileReader()
            reader.onload = function (e) {
                const img = new Image()
                img.src = e.target.result
                img.onload = function () {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')

                    const maxSize = 192
                    let width = img.width
                    let height = img.height

                    if (width > maxSize || height > maxSize) {
                        const aspectRatio = width / height
                        if (width > height) {
                            width = maxSize
                            height = maxSize / aspectRatio
                        } else {
                            height = maxSize
                            width = maxSize * aspectRatio
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    // 转换为base64格式
                    const resizedImageBase64 = canvas.toDataURL('image/jpeg')
                    setAvatars([resizedImageBase64, ...avatars])
                }
            }
            reader.readAsDataURL(file)
        }
    }

    function triggleFileInput() {
        fileInputRef.current.click()
    }

    return (
        <div className="flex flex-col items-center justify-evenly h-[90%] w-full">
            <div className="text-2xl h-10">用户设置</div>
            <div className="flex flex-col justify-evenly items-center w-full flex-1">
                <div className="flex justify-center items-center rounded-full h-20 w-20 border-2 border-slate-100" onClick={handleShowAvatars}>
                    {
                        avatar ? (
                            <NextImage width={100} height={100} alt='' src={avatar} className="h-full w-full rounded-full bg-slate-100" />
                        ) : "选择头像"
                    }
                </div>
                <div className="w-2/3 h-15 flex flex-col items-center justify-center">
                    <input
                        type="text"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => handleInputChanged(e)}
                        className="w-5/6 h-2/3 text-lg p-2 border-b-2 text-center border-blue-100 focus:border-blue-500 focus:outline-none bg-transparent"
                    />
                    <span className="text-red-500 text-xs h-1/3 pt-1">{showInputError ? "用户名长度已至限" : ""}</span>
                </div>
            </div>
            {
                showAvatars && (
                    <Modal contentStyle="fixed flex flex-col items-center rounded-lg justify-center shadow-md top-0 h-full left-0 bg-white w-full z-[100]" backdropStyle=''>
                        <div className="flex items-center text-xl h-[15%]">头像选择</div>
                        <div className="flex justify-center items-center w-11/12 flex-1 mb-5 flex-wrap overflow-y-auto border-slate-100 border-y-[1px] shadow-inner">
                            <input
                                type="file"
                                accept="image/*" // 只接受图片文件
                                onChange={handleFileSelect}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <div className="m-4">
                                <GameButton classes={"!h-14 !w-14 !rounded-full border-2"} onClick={triggleFileInput}>
                                    <AddIcon className={"h-1/2 w-1/2"} />
                                </GameButton>
                            </div>
                            {
                                avatars.map((path, i) => {
                                    return (
                                        <div key={i + 1} className="m-4" onClick={() => handleAvatarSelected(path)}>
                                            <NextImage src={path} width={100} height={100} alt="" className="h-14 w-14" />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </Modal>
                )
            }
        </div >
    )
}


function HomeButton({ shouldStartDisable, handleShowUserPanel, setCurrPage }) {
    function handleStart() {
        setCurrPage("game")
    }
    return (
        <div className="flex flex-col justify-center items-center h-24">
            <GameButton
                onClick={shouldStartDisable ? handleShowUserPanel : handleStart}
                classes={`w-24 !h-10 text-lg font-bold drop-shadow-md text-gray-700 ${shouldStartDisable ? "bg-red-200" : "bg-blue-200"}`}
            >
                {shouldStartDisable ? "用户设置" : "开始游戏"}
            </GameButton>
        </div>
    )
}

export default function Home({ setCurrPage }) {
    const [showUserPanel, setShowUserPanel] = useState(false)
    const [showAvatars, setShowAvatars] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [playerName, setPlayerName] = useLocalStorage("player_name", "")
    const [playerAvatar, setPlayerAvatar] = useLocalStorage("player_avatar", null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    function handleShowAvatars() {
        setShowAvatars(true)
    }

    function handleCloseAvatars() {
        setShowAvatars(false)
    }

    function handleAvatarSelected(path) {
        handleCloseAvatars()
        setPlayerAvatar(path)
    }

    function handleUserNameChanged(username) {
        setPlayerName(username)
    }

    function handleShowUserPanel() {
        setShowUserPanel(!showUserPanel)
    }

    function handleCloseUserPanel() {
        setShowUserPanel(false)
    }

    return (
        <>
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-slate-100 flex items-center justify-center z-[200]">
                    <div className="text-red-500 text-2xl">加载中...</div>
                </div>
            )}
            <div className="flex justify-evenly items-center h-screen w-screen">
                <div className={`fixed top-3 right-4 ${showUserPanel ? 'z-[101]' : ''}`}>
                    <GameButton classes="!w-8 !h-8" onClick={showAvatars ? handleCloseAvatars : handleShowUserPanel}>
                        {showUserPanel ? <CloseIcon className={"w-full h-full"} /> : <UserSettingIcon className={"w-full h-full"} />}
                    </GameButton>
                </div>
                <div className="flex flex-col justify-evenly items-center flex-1 h-full">
                    <HomeTitle />
                    <HomeImage />
                    <HomeButton setCurrPage={setCurrPage} shouldStartDisable={playerName.length == 0 || playerAvatar===null} handleShowUserPanel={handleShowUserPanel} />
                </div>
                {
                    (
                        <>
                            <div className={`${showUserPanel ? "animate-right-in" : "animate-right-out"} fixed top-0 left-2/3 flex w-1/3 shadow-md bg-white h-full justify-center items-center z-[100]`}>
                                <UserProfilePanel
                                    avatar={playerAvatar}
                                    username={playerName}
                                    handleUserNameChanged={handleUserNameChanged}
                                    handleAvatarSelected={handleAvatarSelected}
                                    showAvatars={showAvatars}
                                    handleShowAvatars={handleShowAvatars}
                                />
                            </div>
                            {showUserPanel && <BackDrop classes={"backdrop backdrop-brightness-50"} onClick={handleCloseUserPanel} />}
                        </>
                    )
                }
            </div>
        </>
    )
}
