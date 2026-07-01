import type { CalendarEvent } from "@types";
import TableRow from "./TableRow";
import TableHeadItem from "./TableHeadItem";
import styles from "@styles/Table.module.css";

interface TableDataProps {
	theadData: string[];
	tbodyData: CalendarEvent[];
	className?: string;
}

const Table = ({ theadData, tbodyData, className = "" }: TableDataProps) => {
	return (
		<table className={`${styles.table} ${className}`}>
			<thead>
				<tr>
					{theadData.map((h) => {
						return <TableHeadItem key={h} item={h} />;
					})}
				</tr>
			</thead>
			<tbody>
				{tbodyData.map((item) => {
					return <TableRow key={item.resource.event.id} data={item} />;
				})}
			</tbody>
		</table>
	);
};

export default Table;
