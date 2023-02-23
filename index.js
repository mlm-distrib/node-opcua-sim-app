const opcua = require("node-opcua");

// Define the simulation values
const simulationValues = [
  { nodeId: "ns=1;s=Temperature", dataType: "Double", value: 20.5 },
  { nodeId: "ns=1;s=Pressure", dataType: "Double", value: 10.0 },
  { nodeId: "ns=1;s=Level", dataType: "Double", value: 50.0 },
];

// Create the OPC UA server
const server = new opcua.OPCUAServer({
  port: 4840, // Set the server port
});

// Start the server
server.start(() => {
  console.log(`Server is running at ${server.endpoints[0].endpointDescriptions()[0].endpointUrl}`);
});

// Define the simulation interval
const simulationInterval = setInterval(() => {
  // Update the simulation values
  simulationValues.forEach((value) => {
    value.value += Math.random() - 0.5;
  });

  // Publish the updated values to the OPC UA clients
  const addressSpace = server.engine.addressSpace;
  simulationValues.forEach((value) => {
    const variable = addressSpace.findNode(value.nodeId);
    variable.setValueFromSource({
      dataType: opcua.DataType[value.dataType],
      value: {
        dataType: opcua.DataType[value.dataType],
        value: value.value,
      },
    });
  });
}, 1000); // Update values every 1 second

// Gracefully shutdown the server and clear the simulation interval on exit
process.on("SIGINT", () => {
  clearInterval(simulationInterval);
  server.shutdown(1000, () => {
    console.log("Server is shut down");
    process.exit(0);
  });
});
