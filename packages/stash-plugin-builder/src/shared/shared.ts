import { SharedInterface } from "../interfaces/interface"

// @ts-expect-error skip
const Shared: SharedInterface = {
    dependencies: [],
    crossSourceDependencies: [],
}

export default Shared
