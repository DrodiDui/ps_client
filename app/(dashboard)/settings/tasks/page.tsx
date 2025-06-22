import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import TaskTagListComponent from "@/components/custom/tasks/TaskTagList";

const TaskSettingsPage = () => {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full justify-center"
            defaultValue="item-1"
        >
            <AccordionItem value="item-1">
                <AccordionTrigger>Tasks settings</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">

                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Tags</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <TaskTagListComponent/>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default TaskSettingsPage