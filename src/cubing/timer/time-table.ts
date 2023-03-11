import { SessionDB, Solve } from "./solve-db.js";
import { Time } from "./time.js";
import { TimeStat } from "./time-stat.js";

export class TimeTable {
    private tbody: HTMLTableSectionElement;
    private trs: HTMLTableRowElement[];

    private timeStats: TimeStat[];
    private statIndex: number = 0;

    private loadedSolves: Solve[];

    constructor(table: HTMLTableElement, ...timeStats: TimeStat[]) {
        this.trs = [];
        this.timeStats = timeStats ?? [];
        this.loadedSolves = [];

        this.tbody = document.createElement("tbody");
        table.appendChild(this.tbody);
    }
    private createSolveRow(solve: Solve, index: number): HTMLTableRowElement {
        const tr = document.createElement("tr");

        const timeTable = this;
        tr.addEventListener("click",
            function (this: HTMLTableRowElement, event: MouseEvent) {
                const tr = this;
            
                let solveIndex = Number.parseInt(tr.children[0].textContent ?? "0") - 1;
            
                for (let i = 2; i < tr.children.length; i++) {
                    const node = tr.children[i] as HTMLElement;
                    if (node.matches(":hover")) {
                        // Create stat modal
                    }
                }
            }
        );
        tr.classList.add("time-table-row");

        const tds: HTMLTableCellElement[] = [];
    
        const indexTd = document.createElement("td");
        indexTd.textContent = index.toString();
        tds.push(indexTd);
    
        const timeTd = document.createElement("td");
        timeTd.textContent = Time.formatMillis(solve.time);
        tds.push(timeTd);

        if (++this.statIndex === index) {
            for (const timeStat of this.timeStats) {
                const statTd = document.createElement("td");
                let stat = timeStat.nextTime(solve.time);
                statTd.textContent = isNaN(stat) ? "-" : Time.formatMillis(stat);
                tds.push(statTd);
            }
        }

        for (const td of tds) {
            tr.appendChild(td);
        }
        this.trs.push(tr);

        return tr;
    }
    addSolveRowAbove(solve: Solve, index: number): void {
        this.tbody.insertBefore(this.createSolveRow(solve, index), this.tbody.firstChild);
    }
    addSolveRowBelow(solve: Solve, index: number): void {
        this.tbody.appendChild(this.createSolveRow(solve, index));
    }
    async loadSession(session: SessionDB): Promise<void> {
        const solves = await session.getAllSolves();

        for (let i = 0; i < solves.length; i++) {
            this.addSolveRowAbove(solves[i], i + 1);
            this.loadedSolves.push(solves[i]);
        }
    }
}