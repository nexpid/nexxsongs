import { NextResponse } from "next/server";

type ErrorResponseStatus = "notfound" | "badrequest" | "servererror";
export interface ErrorResponse {
  status: ErrorResponseStatus;
  error: string;
}

export function makeErrorResponse(
  status: ErrorResponseStatus,
  message: string
) {
  let numberStatus = 500;
  switch (status) {
    case "notfound": {
      numberStatus = 404;
      break;
    }
    case "badrequest": {
      numberStatus = 400;
      break;
    }
    case "servererror": {
      numberStatus = 500;
      break;
    }
  }
  return NextResponse.json(
    { error: message, status },
    { status: numberStatus }
  );
}
