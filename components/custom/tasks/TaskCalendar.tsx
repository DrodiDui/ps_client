'use client'

import {useState} from "react";
import {Calendar} from "@/components/ui/calendar";

const TaskCalendarComponent = () => {



    const [date, setDate] = useState<Date | undefined>(new Date())

    return (
        <Calendar
            mode="multiple"
            className="rounded-lg border"
        />
    )
}

export default TaskCalendarComponent