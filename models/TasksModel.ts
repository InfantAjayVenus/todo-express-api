import { readFileSync, writeFileSync } from "fs";
import { ErrorType } from "../types/Errors";
import { Task } from "../types/Todo";

class TaskModel {
    private _taskData: Task[] = [
        {
            id: "alksdnak",
            title: "A Test Task",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quasi neque, iste laborum alias illo repellat temporibus excepturi et quidem.",
            isComplete: false,
            isFavourite: false,
        },
        {
            id: "neqweuy",
            title: "Another Test Task",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quasi neque, iste laborum alias illo repellat temporibus excepturi et quidem.",
            isComplete: false,
            isFavourite: true,
        },
        {
            id: "acjnfoaya",
            title: "A Test Task",
            isComplete: false,
            isFavourite: false,
            dueDate: new Date(),
        }
    ];

    private set tasksList(list: Task[]) {
        this._taskData = list;
        writeFileSync('./tasks.db.json', JSON.stringify(list, null, 2));
    }

    get tasks() {
        if(!this._taskData) {
            this._taskData = JSON.parse(readFileSync('./tasks.db.json', {encoding: 'utf-8'}));
        }
        return this._taskData;
    }

    getTask(taskId: string) {
        const task = this._taskData.find(({ id }) => id === taskId);
        if (!task) throw (ErrorType.NOT_FOUND);

        return task;
    }

    addTask(newTask: Task) {
        this._taskData.push(newTask);
        this.tasksList = [...this._taskData];
        return this._taskData.length;
    }

    updateTask(updateId: string, updatedTaskData: Partial<Task>) {
        const updateIndex = this._taskData.findIndex(({ id }) => id === updateId);
        if (updateIndex < 0) throw (ErrorType.NOT_FOUND);

        this._taskData[updateIndex] = { ...this._taskData[updateIndex], ...updatedTaskData };

        this.tasksList = [...this._taskData];
        return this._taskData[updateIndex];
    }

    removeTask(deleteId: string) {
        this._taskData = this._taskData.filter(({ id }) => id !== deleteId)
    }
}

export default new TaskModel();