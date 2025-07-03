'use client'

import {useState} from "react";
import {Calendar} from "@/components/ui/calendar";
import {TaskResponse} from "@/type/TaskResponse";

interface TaskCalendarProps {
    tasks?: TaskResponse[];
    onDateSelect?: (date: Date | undefined) => void;
    onTaskClick?: (task: TaskResponse) => void;
}

const TaskCalendarComponent = ({ tasks = [], onDateSelect, onTaskClick }: TaskCalendarProps) => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const handleDateSelect = (dates: Date[] | undefined) => {
        const selectedDates = dates || [];
        setSelectedDates(selectedDates);
        onDateSelect?.(selectedDates[selectedDates.length - 1]);
    };

    // Get tasks for selected dates
    const getTasksForDate = (date: Date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.createdDate);
            return taskDate.toDateString() === date.toDateString();
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateSelect}
                className="rounded-lg border"
            />
            
            {selectedDates.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Tasks for selected dates:</h3>
                    <div className="space-y-2">
                        {selectedDates.map(date => {
                            const tasksForDate = getTasksForDate(date);
                            return (
                                <div key={date.toISOString()} className="border rounded p-3">
                                    <h4 className="font-medium text-sm text-gray-600">
                                        {date.toLocaleDateString()}
                                    </h4>
                                    {tasksForDate.length > 0 ? (
                                        <div className="mt-2 space-y-1">
                                            {tasksForDate.map(task => (
                                                <div 
                                                    key={task.taskId}
                                                    className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                                    onClick={() => onTaskClick?.(task)}
                                                >
                                                    <div className="font-medium">{task.taskTitle}</div>
                                                    <div className="text-gray-500">{task.taskStatus.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1">No tasks for this date</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TaskCalendarComponent
