import { Card as MuiCard, CardContent } from "@mui/material";

function Card({ children, className, ...props }) {
  return (
    <MuiCard
      className={className}
      {...props}
      sx={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        ...props.sx,
      }}
    >
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
}

export default Card;
