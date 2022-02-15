
type BreakpointName = string;

type BreakpointSpec = {
  min: number | null;
  max: number | null;
  [key: string]: any;
};

type BreakpointSpecs = {
  [key: string]: BreakpointSpec
};
