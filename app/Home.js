"use client";

import { GameButton, Modal, BackDrop, CloseIcon, UserSettingIcon, AddIcon, TimesIcon } from "@/components"
import { useContext, useEffect, useRef, useState } from "react"
import NextImage from "next/image"
import { useLocalStorage } from "@/utils/hooks";
import { GameSettingsContext } from "@/components/GameContext";

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

function UserSettingPanel({ avatar, username, handleUserNameChanged, handleAvatarSelected, showAvatars, handleShowAvatars, theme, setTheme, gameSettings, setGameSettings }) {
    const imageList = Array.from(new Array(50)).map((_, index) => {
        return `/avatars/Avatars Set Flat Style-${String(index + 1).padStart(2, '0')}.png`
    })
    const [showInputError, setShowInputError] = useState(false)
    const [avatars, setAvatars] = useState(imageList)
    const fileInputRef = useRef(null)
    const [themeOption, setThemeOption] = useState(theme)


    function handleInputChanged(e) {
        const userName = e.target.value
        const sanitizedValue = userName.replace(/[\u4e00-\u9fa5]/g, '__')
        if (sanitizedValue.length <= 20) {
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

    function handleThemeChange(e) {
        setThemeOption(e.target.value)
    }

    useEffect(() => {
        if (themeOption !== 'follow') {
            setTheme(themeOption)
        }
        else {
            if (matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark')
            }
            else {
                setTheme('light')
            }
        }
    }, [themeOption, setTheme])

    function ToggleMusic() {
        setGameSettings({ ...gameSettings, isMusicOn: !gameSettings.isMusicOn })
    }

    function ToggleCardsOrder() {
        setGameSettings({ ...gameSettings, isCardsOrderReverse: !gameSettings.isCardsOrderReverse })
    }

    return (
        <div className="flex flex-col items-center h-full w-full">
            <div className="text-2xl absolute top-0 flex justify-center w-full items-center h-12 border-b-2 dark:border-gray-900 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">设置</div>
            <div className="flex flex-col w-full pt-12 overflow-hidden overflow-y-scroll">
                <div className="flex flex-col w-full gap-4 border-b-[1px] dark:border-gray-600 px-5 py-3">
                    <p className="text-lg font-bold">用户设置</p>
                    <div className="flex items-center w-full justify-between">
                        <div>用户头像</div>
                        <div className="flex justify-center items-center rounded-full h-8 w-8 border-2 border-slate-100" onClick={handleShowAvatars}>
                            {
                                avatar ? (
                                    <NextImage width={100} height={100} alt='' src={avatar} className="h-full w-full rounded-full bg-slate-100" />
                                ) : "+"
                            }
                        </div>
                    </div>
                    <div className="flex items-center w-full justify-between">
                        <div>用户名</div>
                        <div className="flex w-32 flex-col items-end justify-center">
                            <input
                                type="text"
                                placeholder="请输入用户名"
                                value={username}
                                onChange={(e) => handleInputChanged(e)}
                                className={`w-full text-right border-r-2 border-transparent ${showInputError ? 'focus:border-red-500' : 'focus:border-blue-500'} focus:outline-none bg-transparent`}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full gap-4 flex-1 px-5 py-3 border-b-[1px] dark:border-gray-600">
                    <p className="text-lg font-bold">游戏设置</p>
                    <div className="flex items-center w-full justify-between">
                        <div>音乐</div>
                        <label className="relative inline-flex items-center">
                            <input type="checkbox" value="" className="sr-only peer" checked={gameSettings.isMusicOn} onChange={ToggleMusic}/>
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center w-full justify-between">
                        <div>牌序（从大到小）</div>
                        <label className="relative inline-flex items-center">
                            <input type="checkbox" value="" className="sr-only peer" checked={gameSettings.isCardsOrderReverse} onChange={ToggleCardsOrder}/>
                            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
                <div className="flex flex-col w-full gap-4 flex-1 px-5 py-3">
                    <p className="text-lg font-bold">主题设置</p>
                    <label className="flex items-center">
                        <input type='radio' className="h-5 w-5" value='light' checked={themeOption === 'light'} onChange={(e) => handleThemeChange(e)} />
                        <span className="ml-3">普通模式</span>
                    </label>
                    <label className="flex items-center">
                        <input type='radio' className="h-5 w-5" value='dark' checked={themeOption === 'dark'} onChange={(e) => handleThemeChange(e)} />
                        <span className="ml-3">暗黑模式</span>
                    </label>
                    <label className="flex items-center">
                        <input type='radio' className="h-5 w-5" value='follow' checked={themeOption === 'follow'} onChange={(e) => handleThemeChange(e)} />
                        <span className="ml-3">跟随系统</span>
                    </label>
                </div>
            </div>
            {
                showAvatars && (
                    <Modal contentStyle="fixed flex flex-col items-center rounded-lg justify-center shadow-md top-0 h-full left-0 bg-white dark:bg-neutral-900 w-full z-[100]" backdropStyle=''>
                        <div className="flex items-center text-xl h-[15%]">头像选择</div>
                        <div className="flex justify-center items-center w-11/12 flex-1 mb-5 flex-wrap overflow-y-auto border-slate-100 dark:border-gray-600 border-y-[1px] shadow-inner dark:shadow-slate-800">
                            <input
                                type="file"
                                accept="image/*" // 只接受图片文件
                                onChange={handleFileSelect}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <div className="m-4">
                                <GameButton classes={"!h-14 !w-14 !rounded-full border-2"} onClick={triggleFileInput}>
                                    <AddIcon className={"h-1/2 w-1/2 stroke-black dark:stroke-white"} />
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
                classes={`w-24 !h-10 text-lg font-bold drop-shadow-md text-gray-700 dark:text-white ${shouldStartDisable ? "bg-red-200 dark:bg-red-400" : "bg-blue-200 dark:bg-blue-400"}`}
            >
                {shouldStartDisable ? "用户设置" : "开始游戏"}
            </GameButton>
        </div>
    )
}

export default function Home({ theme, setTheme, setCurrPage }) {
    const [showUserPanel, setShowUserPanel] = useState(false)
    const [showAvatars, setShowAvatars] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [playerName, setPlayerName] = useLocalStorage("player_name", "")
    const [playerAvatar, setPlayerAvatar] = useLocalStorage("player_avatar", null)
    const [gameSettings, setGameSettings] = useContext(GameSettingsContext)

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
                <div className="fixed top-0 left-0 w-full h-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center z-[200]">
                    <div className="text-red-500 text-2xl">加载中...</div>
                </div>
            )}
            <div className="flex justify-evenly items-center h-screen w-screen">
                <div className={`fixed top-3 right-4 ${showUserPanel ? 'z-[101]' : ''}`}>
                    <GameButton classes="!w-8 !h-8" onClick={showAvatars ? handleCloseAvatars : handleShowUserPanel}>
                        {showUserPanel ? <TimesIcon className={"w-full h-full dark:fill-white"} /> : <UserSettingIcon className={"w-full h-full dark:fill-white"} />}
                    </GameButton>
                </div>
                <div className="flex flex-col justify-evenly items-center flex-1 h-full">
                    <HomeTitle />
                    <HomeImage />
                    <HomeButton setCurrPage={setCurrPage} shouldStartDisable={playerName.length == 0 || playerAvatar === null} handleShowUserPanel={handleShowUserPanel} />
                </div>
                {
                    (
                        <>
                            <div className={`${showUserPanel ? "animate-right-in" : "animate-right-out"} fixed top-0 right-0 flex w-[30%] shadow-md dark:shadow-slate-300 rounded-md bg-white dark:bg-neutral-900 h-full justify-center items-center z-[100]`}>
                                <UserSettingPanel
                                    avatar={playerAvatar}
                                    username={playerName}
                                    handleUserNameChanged={handleUserNameChanged}
                                    handleAvatarSelected={handleAvatarSelected}
                                    showAvatars={showAvatars}
                                    handleShowAvatars={handleShowAvatars}
                                    theme={theme}
                                    setTheme={setTheme}
                                    gameSettings={gameSettings}
                                    setGameSettings={setGameSettings}
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
