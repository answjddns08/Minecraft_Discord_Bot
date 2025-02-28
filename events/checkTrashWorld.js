import { Events } from "discord.js";
import { promises as fs } from "fs";
import path from "path";

export default {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {import("discord.js").Client} client
	 */
	async execute(client) {
		/*
            버려진 마크 월드 파일을 검사하고 파일이 있는 경우 파일을 확인하고 제거하는 스케쥴 생성
        */
	},
};
