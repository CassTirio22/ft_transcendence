import { Button, TextField } from '@mui/material';
import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect, useRef }  from 'react'
import { createContext, useState } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';
import axios, { set_instance_token, unset_instance_token } from "../service/axios"
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { TOAST_LVL } from '../constants/constants';
import CloseIcon from '@mui/icons-material/Close';
import "./popup-context.scss"
import ProfileView from '../components/profile_view/ProfileView';

let type_value = "";

export function createToastCtx() {

	const set_toast = (level: string, title: string, description: string) => {};

	const ctx = createContext({
		set_toast: set_toast,
	});

	function ToastProvider(props: PropsWithChildren<{}>) {

        const setToast = useRef((level: string, title: string, description: string) => {});

        const set_toast = (level: string, title: string, description: string) => {
            setToast.current(level, title, description);
        }
        

        const Toast = () => {
            const [activate, setActivate] = useState(false);
            const [toastsReload, setToastsReload] = useState(new Date().getTime());

            let toast_type: {[id: number]: any} = {}

            let toasts = useRef(toast_type);

            const toast_fn = (level: string, title: string, description: string) => {
                let start_date = new Date().getTime();
                const new_toast = {
                    level: level,
                    title: title,
                    description: description,
                    time: start_date,
                    inter: null,
                };
                toasts.current[start_date] = new_toast;
                toasts.current[start_date].inter = setTimeout(() => {
                    const p = document.getElementById(`${start_date}-toast-elem`);
                    if (p)
                        p.classList.add("active")
                    toasts.current[start_date].inter = setTimeout(() => {
                        const p2 = document.getElementById(`${start_date}-toast-elem`)
                        if (p2) {
                            p2.classList.remove("active")
                            toasts.current[start_date].inter = setTimeout(() => {
                                delete toasts.current[start_date];
                                const p3 = document.getElementById(`${start_date}-toast-elem`)
                                if (p3)
                                    p3.style.display = "none";
                                    setToastsReload(new Date().getTime())
                            }, 300);
                        }
                    }, 10000);
                }, 100);
                setToastsReload(start_date)
            }


            useEffect(() => {
                setToast.current = toast_fn
            }, [])

            const close = (start_date: number) => {
                const p = document.getElementById(`${start_date}-toast-elem`)
                if (p)
                    p.classList.remove("active")
                clearTimeout(toasts.current[start_date].inter);
                setTimeout(() => {
                    delete toasts.current[start_date];
                    const p1 = document.getElementById(`${start_date}-toast-elem`)
                    if (p1)
                        p1.style.display = "none";
                    setToastsReload(new Date().getTime())
                }, 300);
            }

            useEffect(() => {
            }, [toastsReload])

            return (
                <div className='toasts-container'>
                    {
                        Object.keys(toasts.current).map((elem: string, id: number) => {
                            const toast = toasts.current[parseInt(elem)];
                            return (
                                <div id={`${toast.time}-toast-elem`} key={id} className={`toast ${toast.level}`}>
                                    <div className='row-toast'>
                                        {
                                            toast.level == TOAST_LVL.INFO ? <InfoIcon/> : TOAST_LVL.SUCCESS == toast.level ? <CheckCircleIcon/> : <ErrorIcon/>
                                        }
                                        <div className='toast-content'>
                                            <span>{toast.title}</span>
                                            <p>{toast.description}</p>
                                        </div>
                                    </div>
                                    <CloseIcon onClick={() => close(toast.time)} className='close-btn'/>
                                </div>
                            )
                        })
                    }
                </div>
            )
        }
		return (
			<ctx.Provider value={{ 
                set_toast,
			}}
			{...props} >
                <Toast/>
                {props.children}
            </ctx.Provider>
		);
	}
	return [ctx, ToastProvider] as const;
}