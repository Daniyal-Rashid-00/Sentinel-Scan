import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function Image({ params }: { params: { id: string } }) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#09090b", // zinc-950
                    color: "#34d399", // emerald-400
                    fontSize: 64,
                    fontWeight: "bold",
                }}
            >
                SentinelScan Report: {params.id}
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
