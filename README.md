Traveling Wave Pulse – Interactive Simulation
Overview
This interactive web-based simulation visualizes a one-dimensional traveling wave pulse and the motion it produces at a fixed point on the medium.
The simulation is designed for introductory physics courses to help students understand:
	how a wave pulse moves through space,
	how individual points on the medium move in time,
	and how the mathematical form of a traveling wave connects these ideas.
The simulation runs entirely in a web browser and requires no software installation.

What the Simulation Shows
The display is divided into two parts:
1. Snapshot of the Wave (Top Graph)
The top graph shows the instantaneous shape of the wave pulse along a one-dimensional medium at a given time.
	The horizontal axis represents position x.
	The vertical axis represents displacement of the medium.
	The wave pulse can travel either to the right or to the left.
	A red dot marks the displacement of a specific point on the medium at that instant.
This graph corresponds to the function u(x,t) at a fixed time.

2. History of a Single Point (Bottom Graph)
The bottom graph shows the time history of the displacement of the chosen point (the red dot).
	The horizontal axis represents time.
	The vertical axis represents displacement.
	As the wave pulse passes the point, the graph records how that point moves up and down.
This graph corresponds to the function u(x_0,t) at a fixed position x_0.

Key Physics Concepts Illustrated
Traveling Waves
The simulation uses the standard traveling-wave form:
	Right-moving wave: u(x,t)=u_0 (x-ct)

	Left-moving wave: u(x,t)=u_0 (x+ct)

where:
	u_0 (x) is the pulse shape,
	c is the wave speed.

Wave Motion vs. Particle Motion
A central learning goal of this simulation is to emphasize that:
	The wave pulse moves through space, but
	Points on the medium oscillate locally and do not travel with the wave.
The snapshot graph shows the motion of the wave, while the history graph shows the motion of a single point.

Effect of Pulse Shape and Parameters
Students can explore how changing parameters affect the wave:
	Pulse shape (triangular, square, Gaussian, sinusoidal, etc.)
	Wave speed
	Pulse width
	Pulse height
	Direction of propagation
	Location of the observed point
This helps build intuition about how real wave pulses behave and how different mathematical forms affect motion.

How to Use the Simulation
	Choose a pulse shape and direction.
	Set the initial position of the pulse.
	Select a point of interest on the medium.
	Press Play to animate the pulse.
	Observe:
	how the pulse moves across the top graph,
	how the red dot moves,
	how the history graph is built over time.
Tip:
	For a right-moving wave, choose a point to the right of the pulse’s starting position.
	For a left-moving wave, choose a point to the left of the pulse’s starting position.

Intended Audience
	Introductory algebra-based physics
	Calculus-based physics
	Conceptual physics courses
	Self-study and demonstrations

Technology
	Built with p5.js
	Runs entirely in the browser
	Hosted using GitHub Pages

Educational Use
This simulation is intended for instructional and educational use.
Feel free to share the link with students or embed it in course materials.

