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
    changeFriendStatus?: any,
}

export function createSocketCtx() {

    const send_message = (direct_id: number | null, channel_id: number | null, content: String) => {}
    const in_game = (isPlaying: boolean) => {}
    const reload_socket = () => {};

	const ctx = createContext({
		send_message: send_message,
        in_game: in_game,
        reload_socket: reload_socket
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

        const in_game = (isPlaying: boolean) => {
            if (socket.current) {
                socket.current.emit("game", {
                    isPlaying: isPlaying,
                })
            }
        }

        const reload_socket = () => {
            if (socket.current) {
                socket.current.close();
                socket.current = null;
            }
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

            socket.current.on('game', (e: any) => {
                e.game = true;
                props.changeFriendStatus(e);
            });

            socket.current.on('connection', (e: any) => {
                e.game = false;
                console.log("get user status: ", e);
                props.changeFriendStatus(e);
            });
        }

        useEffect(() => {
            if (user.token && !socket.current) {
                socket.current = io(socket_url, {
                    extraHeaders: {
                      Authorization: `${user.token}`
                    }
                });

                socket.current.on('connect', () => {
                    console.log("connected")
                });

                socket.current.on('disconnect', () => {
                    console.log("disconnected")
                });

                socket.current.on('error', () => {
                    console.log("error")
                });


                socket.current.on('messages', (e: any) => {
                    props.addMessage(e);
                });

                socket.current.on('game', (e: any) => {
                    e.game = true;
                    props.changeFriendStatus(e);
                });

                socket.current.on('connection', (e: any) => {
                    e.game = false;
                    console.log("get user status: ", e);
                    props.changeFriendStatus(e);
                });
            }
            return () => {
                if (socket.current) {
                    socket.current.close()
                }
            }
        }, [user])

		return (
			<ctx.Provider value={{ 
                send_message,
                in_game,
                reload_socket
			}}
			{...props} >
                {props.children}
            </ctx.Provider>
		);
	}
	return [ctx, connect(null, mapDispatchToProps)(SocketProvider)] as const;
}