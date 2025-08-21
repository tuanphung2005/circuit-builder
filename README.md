# CIRCUIT MAKER

## NOTE TO SELF:
DO NOT PUT SCRIPTS SERVER MODULES INSIDE SHARED FOLDER AS IT WILL BE REPLICATED TO CLIENTS (BAD)

## STRUCTURE OF COMPONENT(s) (Model):

EACH HAVE BillboardGUI for indication

Button { Highlight(Highlight), ClickDetector(clickdetector), Base(part), Out(part) }
- activate power for a certain amound of time

Switch { Highlight(Highlight), ClickDetector(clickdetector), Base(part), Out(part) }
- toggle power when activated

And { In1(part), In2(part), Base(part), Out(part) }

Light { In1 (part), Base(part), PointLight(PointLight) }
- set base pointlight brightness to 0, upon being activated should have 10 brightness

Not { In1 (part), Base(part), Out(part) }

## how do we do this?
the part take the in, handle the input(s), output to the out part