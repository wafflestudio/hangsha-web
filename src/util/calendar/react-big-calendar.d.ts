declare module "react-big-calendar/lib/TimeGrid" {
	import { Component } from "react";

	// biome-ignore lint/suspicious/noExplicitAny: declaration for ooutside package type
	export default class TimeGrid extends Component<any> {}
}

declare module "react-big-calendar/lib/Month" {
	import { Component } from "react";

	// biome-ignore lint/suspicious/noExplicitAny: declaration for an untyped package module
	export default class Month extends Component<any> {
		static range: (date: Date, options: unknown) => Date[];
		static navigate: (date: Date, action: unknown, options: unknown) => Date;
		static title: (date: Date, options: unknown) => string;
	}
}
