import type { DbDefinition } from "../../../shared/midas";

const staticLoads = "Static Loads" as const;

export const bodfDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "BODF",
  label: "Self-Weight",
  description: "Self-Weight",
  path: "db/BODF",
  keyLabel: "No.",
  fields: [
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 150 },
    {
      key: "FV",
      label: "Self-Weight Factor",
      kind: "number-array",
      width: 220,
      placeholder: "0,0,-1",
      helperText: "\uC790\uC911 \uACC4\uC218\uB97C X,Y,Z \uC21C\uC11C\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: 0,0,-1"
    }
  ]
};

export const bmldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "BMLD",
  label: "Beam Loads",
  description: "Beam Loads",
  path: "db/BMLD",
  keyLabel: "Element",
  fields: [
    { key: "ID", label: "ID", kind: "integer", width: 90 },
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 140 },
    { key: "CMD", label: "Classification", kind: "text", width: 110 },
    { key: "TYPE", label: "Load Type", kind: "text", width: 120 },
    { key: "DIRECTION", label: "Direction", kind: "text", width: 110 },
    { key: "VX", label: "Vector X", kind: "number", width: 110 },
    { key: "VY", label: "Vector Y", kind: "number", width: 110 },
    { key: "VZ", label: "Vector Z", kind: "number", width: 110 },
    { key: "USE_PROJECTION", label: "Projection", kind: "boolean", width: 110 },
    { key: "USE_ECCEN", label: "Use Eccentricity", kind: "boolean", width: 130 },
    { key: "ECCEN_TYPE", label: "Eccen Type", kind: "integer", width: 110 },
    { key: "ECCEN_DIR", label: "Eccen Dir", kind: "text", width: 110 },
    { key: "I_END", label: "I-End", kind: "number", width: 110 },
    { key: "J_END", label: "J-End", kind: "number", width: 110 },
    { key: "USE_J_END", label: "Use J-End", kind: "boolean", width: 110 },
    {
      key: "D",
      label: "Distance",
      kind: "number-array",
      width: 200,
      placeholder: "0,1,0,0",
      helperText: "\uAC70\uB9AC \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 0,1,0,0"
    },
    {
      key: "P",
      label: "Load",
      kind: "number-array",
      width: 200,
      placeholder: "-50,-50,0,0",
      helperText: "\uD558\uC911 \uAC12 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: -50,-50,0,0"
    },
    { key: "USE_ADDITIONAL", label: "Use Additional", kind: "boolean", width: 120 },
    { key: "ADDITIONAL_I_END", label: "Additional I-End", kind: "number", width: 140 },
    { key: "ADDITIONAL_J_END", label: "Additional J-End", kind: "number", width: 140 },
    { key: "USE_ADDITIONAL_J_END", label: "Use Additional J-End", kind: "boolean", width: 160 }
  ]
};

export const sdspDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "SDSP",
  label: "Specified Displacements of Support",
  description: "Specified Displacements of Support",
  path: "db/SDSP",
  keyLabel: "Node",
  fields: [
    { key: "ID", label: "ID", kind: "integer", width: 90 },
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 150 },
    {
      key: "VALUES",
      label: "Values",
      kind: "object-array",
      width: 280,
      placeholder: '[{"OPT_FLAG":true,"DISPLACEMENT":1.5}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"OPT_FLAG\":true,\"DISPLACEMENT\":1.5}]"
    }
  ]
};

export const nmasDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "NMAS",
  label: "Nodal Masses",
  description: "Nodal Masses",
  path: "db/NMAS",
  keyLabel: "Node",
  fields: [
    { key: "mX", label: "mX", kind: "number", width: 100 },
    { key: "mY", label: "mY", kind: "number", width: 100 },
    { key: "mZ", label: "mZ", kind: "number", width: 100 },
    { key: "rmX", label: "rmX", kind: "number", width: 100 },
    { key: "rmY", label: "rmY", kind: "number", width: 100 },
    { key: "rmZ", label: "rmZ", kind: "number", width: 100 }
  ]
};

export const ltomDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "LTOM",
  label: "Loads to Masses",
  description: "Loads to Masses",
  path: "db/LTOM",
  keyLabel: "No.",
  fields: [
    { key: "DIR", label: "Mass Direction", kind: "text", width: 120 },
    { key: "bNODAL", label: "Nodal Load", kind: "boolean", width: 110 },
    { key: "bBEAM", label: "Beam Load", kind: "boolean", width: 110 },
    { key: "bFLOOR", label: "Floor Load", kind: "boolean", width: 110 },
    { key: "bPRES", label: "Pressure Load", kind: "boolean", width: 120 },
    { key: "GRAV", label: "Gravity", kind: "number", width: 110 },
    {
      key: "vLC",
      label: "Load Case List",
      kind: "object-array",
      width: 260,
      placeholder: '[{"LCNAME":"D","FACTOR":1.0}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"LCNAME\":\"D\",\"FACTOR\":1.0}]"
    }
  ]
};

export const nbofDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "NBOF",
  label: "Nodal Body Force",
  description: "Nodal Body Force",
  path: "db/NBOF",
  keyLabel: "No.",
  fields: [
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "OPT_USE_GROUP", label: "Use Group", kind: "boolean", width: 110 },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 140 },
    {
      key: "KEY_NODE_ITEMS",
      label: "Node Keys",
      kind: "integer-array",
      width: 220,
      placeholder: "12,42,39",
      helperText: "\uB178\uB4DC \uBC88\uD638 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 12,42,39"
    },
    { key: "OPT_NODAL_MASS", label: "Nodal Mass", kind: "boolean", width: 110 },
    { key: "OPT_LOAD_TO_MASS", label: "Load to Mass", kind: "boolean", width: 120 },
    { key: "OPT_STRUCT_MASS", label: "Structure Mass", kind: "boolean", width: 130 },
    { key: "X", label: "X", kind: "number", width: 90 },
    { key: "Y", label: "Y", kind: "number", width: 90 },
    { key: "Z", label: "Z", kind: "number", width: 90 }
  ]
};

export const psltDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "PSLT",
  label: "Define Pressure Load Type",
  description: "Define Pressure Load Type",
  path: "db/PSLT",
  keyLabel: "No.",
  fields: [
    { key: "NAME", label: "Name", kind: "text", width: 160 },
    { key: "DESC", label: "Description", kind: "text", width: 180 },
    { key: "ELEM_TYPE", label: "Element Type", kind: "text", width: 180 },
    {
      key: "PRESSURE_LOAD_ITEMS",
      label: "Pressure Load Items",
      kind: "object-array",
      width: 300,
      placeholder: '[{"LOADCASENAME":"DC","LOADTYPE":"Uniform","LOAD_P1":-20}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"LOADCASENAME\":\"DC\",\"LOADTYPE\":\"Uniform\",\"LOAD_P1\":-20}]"
    }
  ]
};

export const presDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "PRES",
  label: "Assign Pressure Loads",
  description: "Assign Pressure Loads",
  path: "db/PRES",
  keyLabel: "Element",
  fields: [
    { key: "ID", label: "ID", kind: "integer", width: 90 },
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 140 },
    { key: "CMD", label: "Classification", kind: "text", width: 110 },
    { key: "ELEM_TYPE", label: "Element Type", kind: "text", width: 110 },
    { key: "FACE_EDGE_TYPE", label: "Face/Edge Type", kind: "text", width: 130 },
    { key: "DIRECTION", label: "Direction", kind: "text", width: 110 },
    {
      key: "VECTORS",
      label: "Vectors",
      kind: "number-array",
      width: 180,
      placeholder: "0,0,-1",
      helperText: "\uBC29\uD5A5 \uBCA1\uD130 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 0,0,-1"
    },
    { key: "OPT_PROJECTION", label: "Projection", kind: "boolean", width: 110 },
    {
      key: "FORCES",
      label: "Forces",
      kind: "number-array",
      width: 220,
      placeholder: "-10,0,0,0,0",
      helperText: "\uD558\uC911 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: -10,0,0,0,0"
    },
    {
      key: "EDGE_LOADS",
      label: "Edge Loads",
      kind: "number-array",
      width: 200,
      placeholder: "5,0,0",
      helperText: "\uC5E3\uC9C0 \uD558\uC911 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 5,0,0"
    },
    { key: "PSLT_KEY", label: "PSLT Key", kind: "integer", width: 100 },
    { key: "EDGE_FACE", label: "Edge Face", kind: "integer", width: 100 }
  ]
};

export const pnldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "PNLD",
  label: "Define Plane Load Type",
  description: "Define Plane Load Type",
  path: "db/PNLD",
  keyLabel: "No.",
  fields: [
    { key: "NAME", label: "Name", kind: "text", width: 160 },
    { key: "DESC", label: "Description", kind: "text", width: 180 },
    { key: "LTYPE", label: "Load Type", kind: "text", width: 110 },
    {
      key: "POINTLOAD",
      label: "Point Load",
      kind: "object-array",
      width: 260,
      placeholder: '[{"X":0,"Y":0,"F":-10}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"X\":0,\"Y\":0,\"F\":-10}]"
    },
    {
      key: "LINELOAD",
      label: "Line Load",
      kind: "object",
      width: 240,
      placeholder: '{"bUNIFORM":true,"X":[0,3.5],"Y":[0,1.2],"F":[20.5]}',
      helperText: "JSON \uAC1D\uCCB4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: {\"bUNIFORM\":true,\"X\":[0,3.5],\"Y\":[0,1.2],\"F\":[20.5]}"
    },
    {
      key: "AREALOAD",
      label: "Area Load",
      kind: "object",
      width: 260,
      placeholder: '{"bUNIFORM":true,"b3PNT":false,"X":[0,1,1,0],"Y":[0,0,1,1],"LOAD":[-10]}',
      helperText: "JSON \uAC1D\uCCB4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: {\"bUNIFORM\":true,\"b3PNT\":false,\"X\":[0,1,1,0],\"Y\":[0,0,1,1],\"LOAD\":[-10]}"
    },
    {
      key: "COPY_X",
      label: "Copy X",
      kind: "number-array",
      width: 180,
      placeholder: "5,5,5",
      helperText: "X \uBCF5\uC0AC \uAC04\uACA9 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 5,5,5"
    },
    {
      key: "COPY_Y",
      label: "Copy Y",
      kind: "number-array",
      width: 180,
      placeholder: "4.5",
      helperText: "Y \uBCF5\uC0AC \uAC04\uACA9 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 4.5"
    },
    { key: "SEQ", label: "Sequence", kind: "integer", width: 100 }
  ]
};

export const pnlaDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "PNLA",
  label: "Assign Plane Loads",
  description: "Assign Plane Loads",
  path: "db/PNLA",
  keyLabel: "No.",
  fields: [
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "LOAD_GROUP", label: "Load Group", kind: "text", width: 140 },
    { key: "PNLD_KEY", label: "Plane Load Key", kind: "integer", width: 110 },
    { key: "ELEM_TYPE", label: "Element Type", kind: "text", width: 110 },
    {
      key: "POINT_ORIGIN",
      label: "Origin Point",
      kind: "number-array",
      width: 180,
      placeholder: "18,2,0",
      helperText: "\uC6D0\uC810 \uC88C\uD45C\uC785\uB2C8\uB2E4. \uC608: 18,2,0"
    },
    {
      key: "AXIS_X",
      label: "Axis X",
      kind: "number-array",
      width: 180,
      placeholder: "19,2,0",
      helperText: "X \uCD95 \uC88C\uD45C\uC785\uB2C8\uB2E4. \uC608: 19,2,0"
    },
    {
      key: "AXIS_Y",
      label: "Axis Y",
      kind: "number-array",
      width: 180,
      placeholder: "19,3,0",
      helperText: "Y \uCD95 \uC88C\uD45C\uC785\uB2C8\uB2E4. \uC608: 19,3,0"
    },
    { key: "TOL", label: "Tolerance", kind: "number", width: 110 },
    { key: "SELECT_TYPE", label: "Selection Type", kind: "text", width: 130 },
    { key: "ELEM_GROUP", label: "Element Group", kind: "text", width: 140 },
    { key: "FACE_NO", label: "Face No.", kind: "integer", width: 100 },
    { key: "LOAD_DIR", label: "Load Direction", kind: "text", width: 130 },
    { key: "PROJECT_TYPE", label: "Projection Type", kind: "text", width: 130 },
    { key: "bDEFINE_NODE", label: "Define Node", kind: "boolean", width: 110 },
    {
      key: "CONNECT_NODE",
      label: "Connecting Nodes",
      kind: "integer-array",
      width: 220,
      placeholder: "113,121,209,201",
      helperText: "\uC5F0\uACB0 \uB178\uB4DC \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 113,121,209,201"
    },
    { key: "DESC", label: "Description", kind: "text", width: 180 }
  ]
};

export const fbldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "FBLD",
  label: "Define Floor Load Type",
  description: "Define Floor Load Type",
  path: "db/FBLD",
  keyLabel: "No.",
  fields: [
    { key: "NAME", label: "Name", kind: "text", width: 160 },
    { key: "DESC", label: "Description", kind: "text", width: 180 },
    {
      key: "ITEM",
      label: "Floor Load Items",
      kind: "object-array",
      width: 280,
      placeholder: '[{"LCNAME":"DC","FLOOR_LOAD":10,"OPT_SUB_BEAM_WEIGHT":true}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"LCNAME\":\"DC\",\"FLOOR_LOAD\":10,\"OPT_SUB_BEAM_WEIGHT\":true}]"
    }
  ]
};

export const fmldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "FMLD",
  label: "Finishing Material Loads",
  description: "Finishing Material Loads",
  path: "db/FMLD",
  keyLabel: "Element",
  fields: [
    { key: "ID", label: "ID", kind: "integer", width: 90 },
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140 },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 140 },
    { key: "COVERING_TYPE", label: "Covering Type", kind: "text", width: 130 },
    {
      key: "COVERING_RANGE",
      label: "Covering Range",
      kind: "string-array",
      width: 220,
      placeholder: "HALF,HALF,FULL,FULL",
      helperText: "\uBB38\uC790\uC5F4 \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: HALF,HALF,FULL,FULL"
    },
    { key: "THICKNESS", label: "Thickness", kind: "number", width: 110 },
    { key: "DENSITY", label: "Density", kind: "number", width: 110 },
    { key: "DIR", label: "Direction", kind: "text", width: 100 },
    { key: "SCALE_FACTOR", label: "Scale Factor", kind: "number", width: 120 }
  ]
};

export const pospDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "POSP",
  label: "Parameter of Soil Properties",
  description: "Parameter of Soil Properties",
  path: "db/POSP",
  keyLabel: "No.",
  fields: [
    { key: "NAME", label: "Name", kind: "text", width: 160 },
    { key: "DESC", label: "Description", kind: "text", width: 180 },
    { key: "OPT_USE_N", label: "Use N", kind: "boolean", width: 100 },
    { key: "GROUND_LEVEL", label: "Ground Level", kind: "number", width: 120 },
    { key: "BEDROCK_LEVEL", label: "Bedrock Level", kind: "number", width: 120 },
    { key: "FOOTING_LEVEL", label: "Footing Level", kind: "number", width: 120 },
    {
      key: "ITEMS",
      label: "Soil Items",
      kind: "object-array",
      width: 320,
      placeholder: '[{"HEIGHT":7,"ANGLE_OR_N":30,"DENSITY":17,"VS":160,"KH":11449,"DISP":0.001}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"HEIGHT\":7,\"ANGLE_OR_N\":30,\"DENSITY\":17}]"
    }
  ]
};

export const epstDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "EPST",
  label: "Static Earth Pressure",
  description: "Static Earth Pressure",
  path: "db/EPST",
  keyLabel: "No.",
  fields: [
    { key: "LOADCASE", label: "Load Case", kind: "text", width: 140 },
    { key: "DIR", label: "Direction", kind: "text", width: 110 },
    { key: "ANGLE", label: "Angle", kind: "number", width: 110 },
    {
      key: "IN_PT",
      label: "Inner Point",
      kind: "number-array",
      width: 180,
      placeholder: "5000,0,0",
      helperText: "\uAE30\uC900 \uC810 \uC88C\uD45C\uC785\uB2C8\uB2E4. \uC608: 5000,0,0"
    },
    { key: "SF", label: "Scale Factor", kind: "number", width: 110 },
    { key: "EP_TYPE", label: "Earth Pressure Type", kind: "text", width: 160 },
    { key: "SURCHARGE_LOAD", label: "Surcharge Load", kind: "number", width: 130 },
    { key: "WATER_LEVEL", label: "Water Level", kind: "number", width: 120 },
    { key: "SOIL_PROP", label: "Soil Property", kind: "text", width: 140 },
    { key: "SEL_TYPE", label: "Selection Type", kind: "text", width: 130 },
    { key: "ELEM_TYPE", label: "Element Type", kind: "text", width: 120 },
    {
      key: "NODE_LIST",
      label: "Node List",
      kind: "integer-array",
      width: 200,
      placeholder: "101,102,103",
      helperText: "\uB178\uB4DC \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 101,102,103"
    },
    {
      key: "ELEM_LIST",
      label: "Element List",
      kind: "integer-array",
      width: 200,
      placeholder: "201,202",
      helperText: "\uC694\uC18C \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 201,202"
    },
    { key: "LOADING_AREA_GROUP", label: "Area Group", kind: "integer", width: 110 },
    {
      key: "PRES_PROFILE_ITEMS",
      label: "Pressure Profile",
      kind: "object-array",
      width: 320,
      placeholder: '[{"LEVEL":6,"SOIL_PRES":8,"ADD_PRES":0}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"LEVEL\":6,\"SOIL_PRES\":8,\"ADD_PRES\":0}]"
    }
  ]
};

export const epseDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "EPSE",
  label: "Seismic Earth Pressure",
  description: "Seismic Earth Pressure",
  path: "db/EPSE",
  keyLabel: "No.",
  fields: [
    { key: "LOADCASE", label: "Load Case", kind: "text", width: 140 },
    { key: "DIR", label: "Direction", kind: "text", width: 110 },
    { key: "ANGLE", label: "Angle", kind: "number", width: 110 },
    {
      key: "IN_PT",
      label: "Inner Point",
      kind: "number-array",
      width: 180,
      placeholder: "5000,0,0",
      helperText: "\uAE30\uC900 \uC810 \uC88C\uD45C\uC785\uB2C8\uB2E4. \uC608: 5000,0,0"
    },
    { key: "SF", label: "Scale Factor", kind: "number", width: 110 },
    { key: "SOIL_PROP", label: "Soil Property", kind: "text", width: 140 },
    { key: "SEISMIC_COEFF_H", label: "Horizontal Coefficient", kind: "number", width: 170 },
    { key: "SEISMIC_COEFF_V", label: "Vertical Coefficient", kind: "number", width: 160 },
    { key: "SEL_TYPE", label: "Selection Type", kind: "text", width: 130 },
    { key: "ELEM_TYPE", label: "Element Type", kind: "text", width: 120 },
    {
      key: "NODE_LIST",
      label: "Node List",
      kind: "integer-array",
      width: 200,
      placeholder: "101,102,103",
      helperText: "\uB178\uB4DC \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 101,102,103"
    },
    {
      key: "ELEM_LIST",
      label: "Element List",
      kind: "integer-array",
      width: 200,
      placeholder: "201,202",
      helperText: "\uC694\uC18C \uBC30\uC5F4\uC785\uB2C8\uB2E4. \uC608: 201,202"
    },
    {
      key: "PRES_PROFILE_ITEMS",
      label: "Pressure Profile",
      kind: "object-array",
      width: 320,
      placeholder: '[{"LEVEL":6,"SOIL_PRES":8,"ADD_PRES":0}]',
      helperText: "JSON \uAC1D\uCCB4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4. \uC608: [{\"LEVEL\":6,\"SOIL_PRES\":8,\"ADD_PRES\":0}]"
    }
  ]
};

export const poslDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: staticLoads,
  endpoint: "POSL",
  label: "Parameter of Seismic Loads",
  description: "Parameter of Seismic Loads",
  path: "db/POSL",
  keyLabel: "No.",
  fields: [
    { key: "NAME", label: "Name", kind: "text", width: 160 },
    { key: "CODE", label: "Code", kind: "text", width: 170 },
    { key: "METHOD", label: "Method", kind: "text", width: 140 },
    { key: "SZ", label: "Seismic Zone", kind: "text", width: 110 },
    { key: "EPA", label: "EPA", kind: "number", width: 110 },
    { key: "SC", label: "Site Class", kind: "text", width: 110 },
    { key: "FA", label: "Fa", kind: "number", width: 90 },
    { key: "FV", label: "Fv", kind: "number", width: 90 },
    { key: "SDS", label: "SDS", kind: "number", width: 90 },
    { key: "SD1", label: "SD1", kind: "number", width: 90 },
    { key: "USER_GROUP", label: "User Group", kind: "text", width: 120 },
    { key: "IF", label: "Importance Factor", kind: "number", width: 130 },
    { key: "RMF", label: "Response Modification Factor", kind: "number", width: 170 },
    { key: "CALC_OPT", label: "Calculate Data", kind: "boolean", width: 130 }
  ]
};
