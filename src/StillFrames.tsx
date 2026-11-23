import { Composition, HtmlInCanvas } from "remotion";
import { drawFrame, FPS_CONST } from "./Composition";

const SCENE_DURATIONS = [90, 90, 120, 90, 120, 120, 90, 90, 90, 120, 90, 90, 90, 270];
const SCENE_STARTS = [0, 90, 180, 300, 390, 510, 600, 690, 780, 900, 1020, 1110, 1200, 1290];

const StillFrame = ({ sceneIndex }: { sceneIndex: number }) => {
  const globalFrame = SCENE_STARTS[sceneIndex] + Math.floor(SCENE_DURATIONS[sceneIndex] / 2);
  const progress = globalFrame / 1800;
  
  return (
    <HtmlInCanvas
      width={720}
      height={1280}
      onPaint={(params: any) => {
        const canvas = params.canvas || params;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawFrame(ctx, 720, 1280, progress, globalFrame);
      }}
    >
      <div />
    </HtmlInCanvas>
  );
};

export const StillComposition = () => (
  <>
    {SCENE_DURATIONS.map((_, i) => (
      <Composition
        key={i}
        id={`Scene${i+1}Still`}
        component={(props) => <StillFrame {...props} sceneIndex={i} />}
        durationInFrames={1}
        fps={30}
        width={720}
        height={1280}
        calculateMetadata={() => ({ durationInFrames: 1, fps: 30, width: 720, height: 1280 })}
      />
    ))}
  </>
);

export const MyComponent = () => null;