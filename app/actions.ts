'use server'

import { ExcelData } from "@/components/ShowData"
import { auth, signIn, signOut } from "@/lib/auth"
import fs from 'fs'

export async function signInAction() {
    await signIn('google')
}

export async function signOutAction() {
    await signOut()
}

export async function createCalendarEvent(events: ExcelData[], timeZone: string) {
    const session = await auth();

    //@ts-expect-error next auth do not have accessToken in the type
    if (!session || !session?.accessToken) {
        throw new Error("Not authenticated");
    }

    console.log({ session })

    const boundary = "batch_boundary";
    let batchBody = "";

    events.forEach((event, index) => {
        const isAllDay = event.allDay === "true";
        let start, end;

        if (isAllDay) {
            const startDate = event.startTime.split(" ")[0];
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1); // Increment end date by 1 day

            start = `{ "date": "${startDate}", "timeZone": "${timeZone}" }`;
            end = `{ "date": "${endDate.toISOString().split("T")[0]}", "timeZone": "${timeZone}" }`;
        } else {
            start = `{ "dateTime": "${new Date(event.startTime).toISOString()}", "timeZone": "${timeZone}" }`;
            end = `{ "dateTime": "${new Date(event.endTime).toISOString()}", "timeZone": "${timeZone}" }`;
        }

        batchBody += `--${boundary}
Content-Type: application/http
Content-ID: <${index + 1}>

POST /calendar/v3/calendars/primary/events
Content-Type: application/json

{
    "summary": "${event.title}",
    "description": "${event.description || ""}",
    "start": ${start},
    "end": ${end}
}

`;
    });

    batchBody += `--${boundary}--`;

    fs.writeFileSync("batchBody.txt", batchBody);

    const res = await fetch("https://www.googleapis.com/batch/calendar/v3", {
        method: "POST",
        headers: {
            // @ts-expect-error next auth do not have accessToken in the type
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": `multipart/mixed; boundary=${boundary}`,
        },
        body: batchBody,
    });

    fs.writeFileSync("batchResponse.txt", await res.text());

    if (!res.ok) {
        const errorData = await res.text();
        console.error(errorData)
        return { success: false, message: 'failed to add events' }
    }

    return { success: true, message: "Events created successfully!" };
}
