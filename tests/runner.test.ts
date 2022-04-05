import { run } from '../runner';
import { expect } from 'chai';
import 'mocha';

const importObject = {
  imports: {
    // we typically define print to mean logging to the console. To make testing
    // the compiler easier, we define print so it logs to a string object.
    //  We can then examine output to see what would have been printed in the
    //  console.
    print: (arg : any) => {
      importObject.output += arg;
      importObject.output += "\n";
      return arg;
    },
    abs: Math.abs,
    min: Math.min,
    max: Math.max,
    pow: Math.pow
  },

  output: ""
};

// Clear the output before every test
beforeEach(function () {
  importObject.output = "";
});
  
// We write end-to-end tests here to make sure the compiler works as expected.
// You should write enough end-to-end tests until you are confident the compiler
// runs as expected. 
describe('run(source, config) function', () => {
  const config = { importObject };
  
  // We can test the behavior of the compiler in several ways:
  // 1- we can test the return value of a program
  // Note: since run is an async function, we use await to retrieve the 
  // asynchronous return value. 
  it('returns the right number', async () => {
    const result = await run("987", config);
    expect(result).to.equal(987);
  });

  // 2- we can test the behavior of the compiler by also looking at the log 
  // resulting from running the program
  it('prints something right', async() => {
    var result = await run("print(1337)", config);
    expect(config.importObject.output).to.equal("1337\n");
  });

  // 3- we can also combine both type of assertions, or feel free to use any 
  // other assertions provided by chai.
  it('prints two numbers but returns last one', async () => {
    var result = await run("print(987)", config);
    expect(result).to.equal(987);
    result = await run("print(123)", config);
    expect(result).to.equal(123);
    
    expect(config.importObject.output).to.equal("987\n123\n");
  });

  // Note: it is often helpful to write tests for a functionality before you
  // implement it. You will make this test pass!
  it('adds two numbers', async() => {
    const result = await run("2 + 3", config);
    expect(result).to.equal(5);
  });

  // TODO: add additional tests here to ensure the compiler runs as expected
  it('adds multiplies 2 numbers', async() => {
    const result = await run("2 * 3", config);
    expect(result).to.equal(6);
  });

  it('can do abs positive', async() => {
    const result = await run("abs(1)", config);
    expect(result).to.equal(1);
  });

  it('can do negative', async() => {
    const result = await run("-0", config);
    expect(result).to.equal(0);
  });


  it('can do abs negative', async() => {
    const result = await run("abs(-1)", config);
    expect(result).to.equal(1);
  });


  it('can do max', async() => {
    const result = await run("max(2,3)", config);
    expect(result).to.equal(3);
  });

  it('can do min', async() => {
    const result = await run("min(2,3)", config);
    expect(result).to.equal(2);
  });

  it('can do pow', async() => {
    const result = await run("pow(2,3)", config);
    expect(result).to.equal(8);
  });

  it('multiplication over addition?', async() => {
    const result = await run("2*2+3*2", config);
    expect(result).to.equal(10);
  });

  it('multiplication after pow', async() => {
    const result = await run("2*pow(3,4)", config);
    expect(result).to.equal(162);
  });

  it('multiplication after pow', async() => {
    const result = await run("-1*2*pow(3,4)", config);
    expect(result).to.equal(-162);
  });

  it('assignment?', async() => {
    const result = await run("x=1\nprint(x)", config);
    expect(result).to.equal(1);
  });

  it('Wrong assignement should throw an error', async() => {
    const result = await run("x=y\nprint(x)", config);
    expect(result).to.equal(1);
  });

  it('Correct assignement should throw an error', async() => {
    const result = await run("y=3\nx=y\nprint(x)", config);
    expect(result).to.equal(3);
  });

  it('Incorrect Type Assigned', async() => {
    const result = await run("y=.25\nprint(y)", config);
    expect(result).to.equal(3);
  });

  it('More Assignement fun', async() => {
    const result = await run("y=pow(2,2)\nprint(y)", config);
    expect(result).to.equal(4);
  });

  it('Incorrect Acheived', async() => {
    const result = await run("y=pow(2,-2)\nprint(y)", config);
    expect(result).to.equal(3);
  });

  it('Max', async() => {
    const result = await run("abs = 2", config);
    expect(result).to.equal(4);
  });

  it('abs', async() => {
    const result = await run("print = 2", config);
    expect(result).to.equal(1);
  });

  it('abs', async() => {
    const result = await run("x = abs", config);
    expect(result).to.equal(2);
  });




});