export default function SolutionBox ({solutionTriggerParam,solutionParam}) {
    return (
        <div>
            {solutionTriggerParam && (
                <div>
                    <h4>Solution:</h4>
                    <p>{solutionParam}</p>
                </div>
            )}
        </div>
        
    )
    
}