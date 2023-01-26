import { Button, TextField } from '@mui/material';
import React, { Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useRef }  from 'react'
import { createContext, useState } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';
import axios, { set_instance_token, unset_instance_token } from "../service/axios"
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { connect } from 'react-redux';
import { mapDispatchToProps } from '../store/dispatcher';
import { base_url, socket_url } from '../constants/constants';
import { io } from "socket.io-client";
import { AuthContext } from '..';

let type_value = "";

type Props = {
	children?: JSX.Element,
    addMessage?: any,
}

export function createSocketCtx() {

    const send_message = (direct_id: number | null, channel_id: number | null, content: String) => {}

	const ctx = createContext({
		send_message: send_message,
	});

	function SocketProvider(props: Props) {

        const socket = useRef<any | null>(null);

        const {user, isLoggedIn} = useContext(AuthContext);

        const send_message = (direct_id: number | null, channel_id: number | null, content: String) => {
            if (socket.current) {
                socket.current.emit("message", {
                    author_id: user.id,
                    direct_id: direct_id,
                    channel_id: channel_id,
                    content: content,
                })
            }
        }

        useEffect(() => {
            if (user.token) {
                socket.current = io(socket_url, {
                    extraHeaders: {
                      Authorization: `${user.token}`
                    }
                });

                socket.current.on('connect', () => {
                    //console.log("connected")
                });

                socket.current.on('disconnect', () => {
                    //console.log("disconnected")
                });

                socket.current.on('messages', (e: any) => {
                    props.addMessage(e);
                });

                socket.current.on('connection', (e: any) => {
                    //console.log(e)
                });

                setTimeout(() => {
                    socket.current.emit("message", {
                        author_id: user.id,
                        direct_id: 1,
                        channel_id: null,
                        content: "string",
                    })
                }, 1000);
            }
        }, [user])

		return (
			<ctx.Provider value={{ 
                send_message,
			}}
			{...props} >
                {props.children}
            </ctx.Provider>
		);
	}
	return [ctx, connect(null, mapDispatchToProps)(SocketProvider)] as const;
}