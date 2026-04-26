import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, Appdispatch } from "./store"

export const useAppDispatch = () => useDispatch<Appdispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;