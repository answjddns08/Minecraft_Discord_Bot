import { scheduleJob } from "node-schedule";
import cleanUpTrashWorld from "./cleanUpTrashWorld.js";

let isRunning = false;
/**
 * @type {import("node-schedule").Job}
 */
let scheduledJob = null;

/**
 * @typedef {Object} ScheduleControl
 * @property {Function} cancel - 스케줄을 취소하는 함수
 */

/**
 * 버려진 월드를 주기적으로 체크해서 삭제하는 스케줄러를 설정하는 함수
 * @returns {ScheduleControl} 스케줄러 제어 객체 (cancel 메서드 포함)
 */
function cleanUpSchedule() {
	scheduledJob = scheduleJob("0 0 * * *", async () => {
		if (isRunning) return;

		isRunning = true;
		console.log("버려진 월드 체크");
		await cleanUpTrashWorld();
		isRunning = false;
	});

	return {
		cancel: () => {
			if (scheduledJob) {
				scheduledJob.cancel();
				console.log("스케줄이 취소되었습니다.");
			}
		},
	};
}

export default cleanUpSchedule;
