1)The three functions that have different behavior from my compiler are :

1) abs(print(-1))
While python will return Error, my compiler will return 1. This occurs because in my compiler the type of print is int32 while in python the type of print is None. One way to fix this would be to change the type of print in webstrat.ts

2) abs = 2
abs(abs)
While python will return an error ''int' object is not callable, my compiler will return 2. This occurs because in python the abs definition variable overrides the function definition, while in my compiler the functions cannot be redefined. One way to fix this would be prior to excepting the assembly expression in webstrat.ts, checking if the expression name is in local storage/stack and if it is executing it instead. 

3) x = abs 
x(-2)
While python will return 2, my compiler will throw an error "REFERENCE ERROR: Variable Used before Defined" Because when checking for variables it does not think of abs as already defined. One way to fix this is to add all of the custom defined functions to the defined array, that one could use them as values 


2) The resources I found to be the most helpeful were piazza and discussion (Thank you so much for the tutorial)

3) I worked with Joey Rudek on this assignment