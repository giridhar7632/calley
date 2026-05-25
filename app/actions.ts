'use server'

import { ExcelData } from "@/components/ShowData"
import { auth, signIn, signOut } from "@/lib/auth"

export async function signInAction() {
    await signIn('google')
}

export async function signOutAction() {
    await signOut()
}

function parseToISO(dateStr: string): string {
    if (!dateStr) throw new Error("Empty date string");

    dateStr = dateStr.trim();

    // 1. Already ISO → return as-is
    if (dateStr.includes("T")) {
        return new Date(dateStr).toISOString();
    }

    // 2. Split date & time
    const [datePart, timePart] = dateStr.split(" ");

    // Detect format
    let day: number, month: number, year: number;

    if (datePart.includes("/")) {
        // Assume DD/MM/YYYY (your Excel format)
        const parts = datePart.split("/").map(Number);

        if (parts[0] > 12) {
            // DD/MM/YYYY
            [day, month, year] = parts;
        } else {
            // fallback: MM/DD/YYYY (just in case)
            [month, day, year] = parts;
        }
    } else if (datePart.includes("-")) {
        // YYYY-MM-DD
        [year, month, day] = datePart.split("-").map(Number);
    } else {
        throw new Error(`Unsupported date format: ${dateStr}`);
    }

    // Time handling
    let hours = 0, minutes = 0, seconds = 0;

    if (timePart) {
        const timeParts = timePart.split(":").map(Number);
        hours = timeParts[0] || 0;
        minutes = timeParts[1] || 0;
        seconds = timeParts[2] || 0;
    }

    // Convert IST → UTC
    const utcDate = new Date(
        Date.UTC(year, month - 1, day, hours - 5, minutes - 30, seconds)
    );

    return utcDate.toISOString();
}

function parseToDateOnly(dateStr: string): string {
    const clean = dateStr.split(" ")[0].trim();

    let day: number, month: number, year: number;

    if (clean.includes("/")) {
        const parts = clean.split("/").map(Number);

        if (parts[0] > 12) {
            [day, month, year] = parts;
        } else {
            [month, day, year] = parts;
        }
    } else if (clean.includes("-")) {
        [year, month, day] = clean.split("-").map(Number);
    } else {
        throw new Error(`Unsupported date format: ${dateStr}`);
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
            // const startDate = event.startTime.split(" ")[0];
            const startDateStr = event.startTime.split(" ")[0];
            const startDate = parseToDateOnly(startDateStr);

            // Google requires end date to be NEXT day for all-day events
            const endDateObj = new Date(startDate);
            endDateObj.setDate(endDateObj.getDate() + 1);

            const endDate = endDateObj.toISOString().split("T")[0];

            start = `{ "date": "${startDate}" }`;
            end = `{ "date": "${endDate}" }`;
        } else {
            // start = `{ "dateTime": "${new Date(event.startTime).toISOString()}", "timeZone": "${timeZone}" }`;
            // end = `{ "dateTime": "${new Date(event.endTime).toISOString()}", "timeZone": "${timeZone}" }`;
            start = `{ "dateTime": "${parseToISO(event.startTime)}", "timeZone": "${timeZone}" }`;
            end = `{ "dateTime": "${parseToISO(event.endTime)}", "timeZone": "${timeZone}" }`;
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
    const res = await fetch("https://www.googleapis.com/batch/calendar/v3", {
        method: "POST",
        headers: {
            // @ts-expect-error next auth do not have accessToken in the type
            "Authorization": `Bearer ${session.accessToken}`,
            "Content-Type": `multipart/mixed; boundary=${boundary}`,
        },
        body: batchBody,
    });

    if (!res.ok) {
        const errorData = await res.text();
        console.error(errorData)
        return { success: false, message: 'failed to add events' }
    }

    return { success: true, message: "Events created successfully!" };
}
