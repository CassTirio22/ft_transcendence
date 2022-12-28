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

export function createPopupCtx() {

	const open_confirm = (title: string, body="", confirm_value="", callback: any) => {};
    const close_confirm = () => {};
	const set_toast = (level: string, title: string, description: string) => {};
    const show_profile = (id: string) => {};

	const ctx = createContext({
		open_confirm: open_confirm,
		close_confirm: close_confirm,
		set_toast: set_toast,
        show_profile: show_profile,
	});

	function PopupProvider(props: PropsWithChildren<{}>) {
        
        const set_confirm_ref = useRef((confirm_value: any) => {});

        const profile_ref = useRef((id: string) => {});

        const setToast = useRef((level: string, title: string, description: string) => {});

        const show_profile = (id: string) => {
            profile_ref.current(id);
        };

        const set_toast = (level: string, title: string, description: string) => {
            setToast.current(level, title, description);
        }

        const open_confirm = (title: string, body="", confirm_value="", callback: any) => {
            set_confirm_ref.current({value: confirm_value, title: title, body: body, is_open: true, callback: callback});
            document.body.style.overflow = "hidden";
        }

        const close_confirm = () => {
            set_confirm_ref.current({value: "", is_open: false})
            document.body.style.overflow = "unset";
            type_value = "";
        }

        const Confirm = () => {

            const [confirm, setConfirm] = useState({
                value: "test",
                title: "Delete text message",
                body: "This action cannot be undone. This will permanently delete the selected messages.",
                is_open: false,
                callback: () => null,
            });
            const [reload, setReload] = useState(false);

            const set_config_fn = (confirm_value: any) => {
                setConfirm(confirm_value)
            }
            
            useEffect(() => {
                set_confirm_ref.current = set_config_fn;
            }, [])
            

            if (!confirm.is_open)
                return null;
            return (
                <div className='confirm-view'>
                    <div className='confirm-view-center'>
                        <div className='confirm-view-header'>
                            <h3>{confirm.title}</h3>
                        </div>
                        <div className='confirm-view-body'>
                            <p>{confirm.body}</p>
                            {
                                confirm.value != "" ? 
                                <>
                                    <p>Please type <span className='bold'>{confirm.value}</span> to confirm</p>
                                    <TextField size="small" defaultValue={type_value} onChange={(e) => {type_value=e.target.value;if (type_value == confirm.value)setReload(!reload)}} fullWidth className='value-input' id="outlined-basic" label={confirm.value} variant="outlined" />
                                </>
                                : null
                            }

                        </div>
                        <div className='confirm-view-footer'>
                            <Button onClick={close_confirm} variant="outlined">Cancel</Button>
                            <Button disabled={type_value != confirm.value} onClick={() => {confirm.callback();close_confirm()}} variant="contained">Confirm</Button>
                        </div>
                    </div>
                </div>
            )
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
                open_confirm,
                close_confirm,
                set_toast,
                show_profile
			}}
			{...props} >
                <Toast/>
                <Confirm/>
                <ProfileView reference={profile_ref} />
                {props.children}
            </ctx.Provider>
		);
	}
	return [ctx, PopupProvider] as const;
}