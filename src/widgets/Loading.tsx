import { ClipLoader } from "react-spinners";

const Loading = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				paddingBottom: 100,
			}}
		>
			<ClipLoader size={50} />
		</div>
	);
};

export default Loading;
