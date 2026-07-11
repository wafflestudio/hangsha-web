import type { EventDetail, Event } from "@/util/types";
import styles from "./EventDate.module.css";
import { eventDateRenderer } from "@/util/Calendar/eventDateRenderer";


// label - null : 테이블에 넣는 경우
const BaseDate = ({label, startDate, endDate}: {label: string | null, startDate: Date | null, endDate: Date | null}) => 
    <div className={styles.dateRow}>
        {(startDate || endDate) && <>
            <span className={styles.dateLabel}>{label}</span>
            <span className={styles.date}>
                {`${eventDateRenderer(startDate, endDate)}`}
            </span>
        </>}
    </div>;

export const ApplyDate = ({label="지원 기간", applyStart, applyEnd}: {label?: string | null, applyStart: Date | null, applyEnd: Date | null}) => 
        <BaseDate label={label} startDate={applyStart} endDate={applyEnd} />;

export const StartDate = ({label="행사 날짜", eventStart, eventEnd}: {label?: string | null, eventStart: Date | null, eventEnd: Date | null}) =>
        <BaseDate label={label} startDate={eventStart} endDate={eventEnd} />;


const EventDate = ({event} : {event: EventDetail | Event}) => 
	<div className={styles.dateColumn}>
        <StartDate eventStart={event.eventStart} eventEnd={event.eventEnd} />
        <ApplyDate applyStart={event.applyStart} applyEnd={event.applyEnd} />
    </div>;


export default EventDate;