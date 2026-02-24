import { scheduleJob } from "node-schedule";
import cleanUpTrashWorld from "./cleanUpTrashWorld.js";

let isRunning = false;
let scheduledJob = null;

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
